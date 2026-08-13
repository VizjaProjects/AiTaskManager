using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Abstraction.Workspace;

public record UserWorkspace(Guid UserId, string FullName, string Email);

public interface IUserWorkspace
{
    Task<IReadOnlyList<UserWorkspace>> GetAllWorkspaceUsersAsync(Guid workspaceId, Guid callingUserIdGuid,
        CancellationToken cancellationToken = default);
}