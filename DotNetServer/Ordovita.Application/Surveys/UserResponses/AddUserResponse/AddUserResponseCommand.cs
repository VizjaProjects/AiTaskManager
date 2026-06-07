using Ordovita.Application.Common.Cqrs;

namespace Ordovita.Application.Surveys.UserResponses.AddUserResponse;

public sealed record AddUserResponseCommand(
    Guid SurveyId,
    Guid QuestionId,
    string Answer) : ICommand<AddUserResponseResult>;

public sealed record AddUserResponseResult(
    Guid UserResponseId,
    Guid QuestionId,
    Guid SurveyId,
    string Answer,
    DateTime CreatedAt);