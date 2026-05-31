using Ordovita.Application.Common.Cqrs;

namespace Ordovita.Application.Surveys.UserResponses.ChangeUserResponse;

public sealed record ChangeUserResponseCommand(Guid UserResponseId, string NewAnswer)
    : ICommand<ChangeUserResponseResult>;

public sealed record ChangeUserResponseResult(
    Guid UserResponseId,
    string TextAnswer,
    DateTime UpdatedAt);