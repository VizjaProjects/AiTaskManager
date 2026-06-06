using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Workspaces;

namespace Ordovita.Application.Workspaces.GetMyWorkspaces;

public sealed record GetMyWorkspacesQuery : IQuery<IReadOnlyList<WorkspaceDto>>;