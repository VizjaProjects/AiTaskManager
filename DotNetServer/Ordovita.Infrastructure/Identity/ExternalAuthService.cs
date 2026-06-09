using Microsoft.AspNetCore.Identity;
using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;

namespace Ordovita.Infrastructure.Identity;

public sealed class ExternalAuthService(
    UserManager<AspIdentityUser> userManager,
    IUserRepository userRepository,
    IUnitOfWork uow) : IExternalAuthService
{
    private const string Provider = "Google";

    public async Task<Result<ExternalAuthUser>> FindOrCreateGoogleUserAsync(
        string googleSubject,
        string email,
        string fullName,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure<ExternalAuthUser>(Error.Unauthorized("ExternalAuthService",
                "Google account has no email"));

        if (string.IsNullOrWhiteSpace(fullName))
            fullName = email.Split('@')[0];

        var loginInfo = new UserLoginInfo(Provider, googleSubject, Provider);

        var aspUser = await userManager.FindByLoginAsync(Provider, googleSubject)
                      ?? await userManager.FindByEmailAsync(email);

        if (aspUser is null)
        {
            aspUser = new AspIdentityUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
            };

            var createResult = await userManager.CreateAsync(aspUser);
            if (!createResult.Succeeded)
                return Result.Failure<ExternalAuthUser>(Error.Unauthorized("ExternalAuthService",
                    createResult.Errors.First().Description));

            await userManager.AddToRoleAsync(aspUser, Role.USER.ToString());

            var domainUserResult = DomainUser.Create(fullName, Domain.Identity.Email.From(email), Role.USER, aspUser.Id);
            if (domainUserResult.IsFailure || domainUserResult.Value is null)
                return Result.Failure<ExternalAuthUser>(domainUserResult.Error);

            var verifyResult = domainUserResult.Value.VerifyEmail();
            if (verifyResult.IsFailure)
                return Result.Failure<ExternalAuthUser>(verifyResult.Error);

            await userRepository.AddAsync(domainUserResult.Value, ct);
        }
        else
        {
            if (!await userManager.IsInRoleAsync(aspUser, Role.USER.ToString()))
                await userManager.AddToRoleAsync(aspUser, Role.USER.ToString());

            var domainUser = await userRepository.GetAsyncByAspId(aspUser.Id, ct);
            if (domainUser is null)
            {
                var domainUserResult = DomainUser.Create(fullName, Domain.Identity.Email.From(email), Role.USER, aspUser.Id);
                if (domainUserResult.IsFailure || domainUserResult.Value is null)
                    return Result.Failure<ExternalAuthUser>(domainUserResult.Error);

                domainUserResult.Value.VerifyEmail();
                await userRepository.AddAsync(domainUserResult.Value, ct);
            }
            else if (!domainUser.IsEmailVerified || !domainUser.IsEnable)
            {
                domainUser.VerifyEmail();
            }
        }

        var existingLogins = await userManager.GetLoginsAsync(aspUser);
        if (existingLogins.All(l => l.LoginProvider != Provider || l.ProviderKey != googleSubject))
        {
            var linkResult = await userManager.AddLoginAsync(aspUser, loginInfo);
            if (!linkResult.Succeeded)
                return Result.Failure<ExternalAuthUser>(Error.Unauthorized("ExternalAuthService",
                    linkResult.Errors.First().Description));
        }

        await uow.SaveChangesAsync(ct);

        var domain = await userRepository.GetAsyncByAspId(aspUser.Id, ct);
        if (domain is null)
            return Result.Failure<ExternalAuthUser>(Error.NotFound("ExternalAuthService", "Domain user not found"));

        return Result.Success(new ExternalAuthUser(
            aspUser.Id,
            domain.Id.Value,
            domain.Email.Value,
            domain.FullName,
            domain.Role.ToString()));
    }
}
