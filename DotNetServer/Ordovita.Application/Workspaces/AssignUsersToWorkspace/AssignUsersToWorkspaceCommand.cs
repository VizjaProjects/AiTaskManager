using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Workspaces;

namespace Ordovita.Application.Workspaces.AssignUsersToWorkspace;

public sealed record AssignUsersToWorkspaceCommand(Guid WorkspaceId, IReadOnlyList<Guid> UserIds)
    : ICommand<WorkspaceDto>;