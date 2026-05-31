using Ordovita.Application.Common.Cqrs;

namespace Ordovita.Application.Workspaces.DeleteWorkspace;

public sealed record DeleteWorkspaceCommand(Guid WorkspaceId) : ICommand<Unit>;
