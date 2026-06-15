using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Workspaces;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Workspaces.CreateWorkspace;

public sealed record CreateWorkspaceCommand(
    string WorkspaceName,
    IReadOnlyList<Guid>? AssignedUserIds,
    WorkspaceVisibility Visibility = WorkspaceVisibility.Private)
    : ICommand<WorkspaceDto>;