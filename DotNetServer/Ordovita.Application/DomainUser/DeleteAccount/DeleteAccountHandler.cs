using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.User;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;

namespace Ordovita.Application.DomainUser.DeleteAccount;

public class DeleteAccountHandler(IUserRepository repository, IUnitOfWork uow, IUserContext userContext)
    : ICommandHandler<DeleteAccountCommand, UserDto>
{
    public async Task<Result<UserDto>> Handle(DeleteAccountCommand command, CancellationToken ct)
    {
        var userId = userContext.UserId;

        if (userId == null)
            return Result.Failure<UserDto>(Error.NotFound("ChangeFullnameHandler", "User not foud!"));

        var user = await repository.GetAsyncByAspId(userId.Value.ToString(), ct);

        if (user == null)
            return Result.Failure<UserDto>(Error.NotFound("ChangeFullnameHandler", "User not foud!"));

        user.DeleteAccount();

        await uow.SaveChangesAsync(ct);

        var userDto = new UserDto(user.FullName, user.Email, user.Role);

        return Result.Success(userDto);
    }
}