using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Surveys.Exception;
using Ordovita.Domain.Surveys.port;
using Ordovita.Domain.Surveys.Questions;
using Ordovita.Domain.Surveys.Surveys;
using Ordovita.Domain.Surveys.UserResponse;

namespace Ordovita.Application.Surveys.UserResponses.AddUserResponse;

public sealed class AddUserResponseHandler(
    IUserContext userContext,
    IUserRepository userRepository,
    IQuestionRepository questionRepository,
    IUserResponseRepository userResponseRepository,
    IUnitOfWork uow) : ICommandHandler<AddUserResponseCommand, AddUserResponseResult>
{
    public async Task<Result<AddUserResponseResult>> Handle(AddUserResponseCommand command, CancellationToken ct)
    {
        var userResult = await SurveyUserResolver.GetCurrentDomainUserAsync(userContext, userRepository, ct);
        if (userResult.IsFailure)
            return Result.Failure<AddUserResponseResult>(userResult.Error);

        var questionId = QuestionId.From(command.QuestionId);
        var question = await questionRepository.GetByIdAsync(questionId, ct);
        if (question is null)
            return Result.Failure<AddUserResponseResult>(QuestionException.NotFound);

        if (question.SurveyId != SurveyId.From(command.SurveyId))
            return Result.Failure<AddUserResponseResult>(QuestionException.NotFound);

        if (await userResponseRepository.ExistsForUserAndQuestionAsync(userResult.Value!.Id, questionId, ct))
            return Result.Failure<AddUserResponseResult>(UserResponseException.AlreadyAnswered);

        TextAnswer textAnswer;
        try
        {
            textAnswer = TextAnswer.From(command.Answer);
        }
        catch (ArgumentException ex)
        {
            return Result.Failure<AddUserResponseResult>(
                Error.Validation("UserResponse.InvalidAnswer", ex.Message));
        }

        var response = UserResponse.Create(userResult.Value.Id, questionId, textAnswer);
        if (response.IsFailure)
            return Result.Failure<AddUserResponseResult>(response.Error);

        await userResponseRepository.AddAsync(response.Value!, ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success(new AddUserResponseResult(
            questionId.Value,
            command.SurveyId,
            textAnswer.Value,
            response.Value!.CreatedAt));
    }
}