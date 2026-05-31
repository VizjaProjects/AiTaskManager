using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;

namespace Ordovita.Application.Identity.ConfirmUserEmail;

public class ConfirmUserEmailHandler(IUserRepository repository, IUnitOfWork uow)
    : ICommandHandler<ConfirmUserEmailCommand, Guid>
{
    public async Task<Result<Guid>> Handle(ConfirmUserEmailCommand command, CancellationToken ct)
    {
        var user = await repository.GetAsyncByAspId(command.AspUserId, ct);

        if (user == null)
            return Result.Failure<Guid>(Error.NotFound("ConfirmUserEmailHandler", "User not found"));

        user.VerifyEmail();

        await uow.SaveChangesAsync(ct);

        return Result.Success(user.Id.Value);
    }
}