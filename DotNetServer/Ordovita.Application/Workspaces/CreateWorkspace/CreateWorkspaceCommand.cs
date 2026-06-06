using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Workspaces;

namespace Ordovita.Application.Workspaces.CreateWorkspace;

public sealed record CreateWorkspaceCommand(string WorkspaceName, IReadOnlyList<Guid>? AssignedUserIds)
    : ICommand<WorkspaceDto>;