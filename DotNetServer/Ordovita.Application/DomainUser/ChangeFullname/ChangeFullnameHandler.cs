using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.User;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;

namespace Ordovita.Application.DomainUser.ChangeFullname;

public class ChangeFullnameHandler(IUserRepository repository, IUnitOfWork uow, IUserContext userContext)
    : ICommandHandler<ChangeFullNameCommand, UserDto>
{
    public async Task<Result<UserDto>> Handle(ChangeFullNameCommand command, CancellationToken ct)
    {
        var userId = userContext.UserId;

        if (userId == null)
            return Result.Failure<UserDto>(Error.NotFound("ChangeFullnameHandler", "User not foud!"));

        var user = await repository.GetAsyncByAspId(userId.Value.ToString(), ct);

        if (user == null)
            return Result.Failure<UserDto>(Error.NotFound("ChangeFullnameHandler", "User not foud!"));


        user.ChangeFullname(command.NewFullName);

        await uow.SaveChangesAsync(ct);

        var userDto = new UserDto(user.FullName, user.Email, user.Role);

        return Result.Success(userDto);
    }
}