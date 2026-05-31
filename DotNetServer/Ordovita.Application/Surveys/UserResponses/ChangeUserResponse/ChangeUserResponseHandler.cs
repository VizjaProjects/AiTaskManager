using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Surveys.Exception;
using Ordovita.Domain.Surveys.port;
using Ordovita.Domain.Surveys.UserResponse;

namespace Ordovita.Application.Surveys.UserResponses.ChangeUserResponse;

public sealed class ChangeUserResponseHandler(
    IUserContext userContext,
    IUserRepository userRepository,
    IUserResponseRepository userResponseRepository,
    IUnitOfWork uow) : ICommandHandler<ChangeUserResponseCommand, ChangeUserResponseResult>
{
    public async Task<Result<ChangeUserResponseResult>> Handle(ChangeUserResponseCommand command, CancellationToken ct)
    {
        var userResult = await SurveyUserResolver.GetCurrentDomainUserAsync(userContext, userRepository, ct);
        if (userResult.IsFailure)
            return Result.Failure<ChangeUserResponseResult>(userResult.Error);

        var userResponseId = UserResponseId.From(command.UserResponseId);
        var userResponse = await userResponseRepository.GetByUserAndResponseIdAsync(
            userResult.Value!.Id, userResponseId, ct);
        if (userResponse is null)
            return Result.Failure<ChangeUserResponseResult>(UserResponseException.NotFound);

        TextAnswer textAnswer;
        try
        {
            textAnswer = TextAnswer.From(command.NewAnswer);
        }
        catch (ArgumentException ex)
        {
            return Result.Failure<ChangeUserResponseResult>(
                Error.Validation("UserResponse.InvalidAnswer", ex.Message));
        }

        var changeResult = userResponse.ChangeResponse(textAnswer);
        if (changeResult.IsFailure)
            return Result.Failure<ChangeUserResponseResult>(changeResult.Error);

        await uow.SaveChangesAsync(ct);

        return Result.Success(new ChangeUserResponseResult(
            userResponseId.Value, userResponse.TextAnswer.Value, userResponse.UpdatedAt));
    }
}
