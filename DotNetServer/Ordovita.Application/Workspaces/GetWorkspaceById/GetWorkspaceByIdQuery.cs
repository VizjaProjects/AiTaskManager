using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Workspaces;

namespace Ordovita.Application.Workspaces.GetWorkspaceById;

public sealed record GetWorkspaceByIdQuery(Guid WorkspaceId) : IQuery<WorkspaceDto>;