using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Ordovita.Application.Abstraction.Identity;
using Ordovita.Domain.Common;
using Ordovita.Infrastructure.Identity;

namespace Ordovita.Infrastructure.AspIdentity;

public sealed class AspIdentityService() : IAspIdentityService
{
    public async Task<Result<string>> CreateAspIdentityUserAsync(IServiceProvider sp, string email, string password,
        CancellationToken ct = default)
    {
        var userManager = sp.GetRequiredService<UserManager<AspIdentityUser>>();

        if (!userManager.SupportsUserEmail)
            throw new NotSupportedException(
                $"{nameof(CreateAspIdentityUserAsync)} requires a user store with email support.");

        var userStore = sp.GetRequiredService<IUserStore<AspIdentityUser>>();
        var emailStore = (IUserEmailStore<AspIdentityUser>)userStore;

        var emailValidator = new EmailAddressAttribute();

        if (string.IsNullOrEmpty(email) || !emailValidator.IsValid(email))
            return Result.Failure<string>(Error.AspIdentity("AspIdentityService", "Invalid email format!"));

        var user = new AspIdentityUser();
        await userStore.SetUserNameAsync(user, email, CancellationToken.None);
        await emailStore.SetEmailAsync(user, email, CancellationToken.None);
        var result = await userManager.CreateAsync(user, password);

        if (!result.Succeeded)
            return Result.Failure<string>(Error.AspIdentity("AspIdentityService", result.Errors.First().Description));
   

        return Result.Success(user.Id);
    }


}