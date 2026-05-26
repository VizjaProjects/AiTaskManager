using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;

namespace Ordovita.Application.Identity.RegisterUser;

public sealed class RegisterUserHandler(
    IAspIdentityService identityService,
    IServiceProvider sp,
    IUnitOfWork uow,
    IUserRepository userRepository)
    : ICommandHandler<RegisterUserCommand, Guid>
{
    public async Task<Result<Guid>> Handle(RegisterUserCommand command, CancellationToken ct)
    {
        var identityUserResult =
            await identityService.CreateAspIdentityUserAsync(sp, command.Email, command.Password, ct);

        if (identityUserResult.IsFailure || string.IsNullOrWhiteSpace(identityUserResult.Value))
            return Result.Failure<Guid>(identityUserResult.Error);


        var user = DomainUser.Create(command.FullName, Email.From(command.Email), command.Role,
            identityUserResult.Value);

        if (user.IsFailure || user.Value == null)
            return Result.Failure<Guid>(user.Error);

        await userRepository.AddAsync(user.Value, ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success(user.Value.Id.Value);
    }
}