using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Workspaces;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Workspace;
using Ordovita.Domain.Workspace.Exception;
using Ordovita.Domain.Workspace.port;

namespace Ordovita.Application.Workspaces.GetWorkspaceById;

public sealed class GetWorkspaceByIdHandler(
    IUserContext userContext,
    IUserRepository userRepository,
    IWorkspaceRepository workspaceRepository) : IQueryHandler<GetWorkspaceByIdQuery, WorkspaceDto>
{
    public async Task<Result<WorkspaceDto>> Handle(GetWorkspaceByIdQuery query, CancellationToken ct)
    {
        var userResult = await WorkspaceUserResolver.GetCurrentDomainUserAsync(userContext, userRepository, ct);
        if (userResult.IsFailure)
            return Result.Failure<WorkspaceDto>(userResult.Error);

        var workspace = await workspaceRepository.GetByIdAsync(WorkspaceId.From(query.WorkspaceId), ct);
        if (workspace is null)
            return Result.Failure<WorkspaceDto>(WorkspaceException.NotFound);

        if (!workspace.CanBeAccessedBy(userResult.Value!.Id))
            return Result.Failure<WorkspaceDto>(WorkspaceException.UnauthorizedAccess);

        return Result.Success(WorkspaceMapper.ToDto(workspace));
    }
}