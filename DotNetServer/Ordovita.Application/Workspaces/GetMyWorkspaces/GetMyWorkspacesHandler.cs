using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Workspaces;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Workspace.port;

namespace Ordovita.Application.Workspaces.GetMyWorkspaces;

public sealed class GetMyWorkspacesHandler(
    IUserContext userContext,
    IUserRepository userRepository,
    IWorkspaceRepository workspaceRepository)
    : IQueryHandler<GetMyWorkspacesQuery, IReadOnlyList<WorkspaceDto>>
{
    public async Task<Result<IReadOnlyList<WorkspaceDto>>> Handle(GetMyWorkspacesQuery query, CancellationToken ct)
    {
        var userResult = await WorkspaceUserResolver.GetCurrentDomainUserAsync(userContext, userRepository, ct);
        if (userResult.IsFailure)
            return Result.Failure<IReadOnlyList<WorkspaceDto>>(userResult.Error);

        var workspaces = await workspaceRepository.GetByCreatedByAsync(userResult.Value!.Id, ct);
        var result = workspaces.Select(WorkspaceMapper.ToDto).ToList();
        return Result.Success<IReadOnlyList<WorkspaceDto>>(result);
    }
}
