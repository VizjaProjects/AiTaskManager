using Ordovita.Application.Common.Cqrs;

namespace Ordovita.Application.Surveys.UserResponses.DeleteUserResponse;

public sealed record DeleteUserResponseCommand(Guid UserResponseId) : ICommand<Unit>;