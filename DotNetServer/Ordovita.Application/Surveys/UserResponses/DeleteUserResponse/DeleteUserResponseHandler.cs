using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Surveys.Exception;
using Ordovita.Domain.Surveys.port;
using Ordovita.Domain.Surveys.UserResponse;

namespace Ordovita.Application.Surveys.UserResponses.DeleteUserResponse;

public sealed class DeleteUserResponseHandler(
    IUserContext userContext,
    IUserRepository userRepository,
    IUserResponseRepository userResponseRepository,
    IUnitOfWork uow) : ICommandHandler<DeleteUserResponseCommand, Unit>
{
    public async Task<Result<Unit>> Handle(DeleteUserResponseCommand command, CancellationToken ct)
    {
        var userResult = await SurveyUserResolver.GetCurrentDomainUserAsync(userContext, userRepository, ct);
        if (userResult.IsFailure)
            return Result.Failure<Unit>(userResult.Error);

        var userResponseId = UserResponseId.From(command.UserResponseId);
        var userResponse = await userResponseRepository.GetByUserAndResponseIdAsync(
            userResult.Value!.Id, userResponseId, ct);
        if (userResponse is null)
            return Result.Failure<Unit>(UserResponseException.NotFound);

        userResponseRepository.Delete(userResponse);
        await uow.SaveChangesAsync(ct);

        return Result.Success(Unit.Value);
    }
}
