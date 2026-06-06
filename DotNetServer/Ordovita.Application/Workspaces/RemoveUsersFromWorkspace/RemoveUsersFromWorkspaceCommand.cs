using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Workspaces;

namespace Ordovita.Application.Workspaces.RemoveUsersFromWorkspace;

public sealed record RemoveUsersFromWorkspaceCommand(Guid WorkspaceId, IReadOnlyList<Guid> UserIds)
    : ICommand<WorkspaceDto>;