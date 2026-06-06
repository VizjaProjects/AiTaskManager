using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Workspaces;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Workspace;
using Ordovita.Domain.Workspace.Exception;
using Ordovita.Domain.Workspace.port;
using DomainUserEntity = Ordovita.Domain.Identity.DomainUser;

namespace Ordovita.Application.Tasks;

public sealed class WorkspaceAccessGuard(
    IUserContext userContext,
    IUserRepository userRepository,
    IWorkspaceRepository workspaceRepository)
{
    public async Task<Result<(DomainUserEntity User, Workspace Workspace)>> RequireAccessAsync(
        Guid workspaceId, CancellationToken ct)
    {
        var userResult = await WorkspaceUserResolver.GetCurrentDomainUserAsync(userContext, userRepository, ct);
        if (userResult.IsFailure)
            return Result.Failure<(DomainUserEntity, Workspace)>(userResult.Error);

        var workspace = await workspaceRepository.GetByIdAsync(WorkspaceId.From(workspaceId), ct);
        if (workspace is null)
            return Result.Failure<(DomainUserEntity, Workspace)>(WorkspaceException.NotFound);

        if (!workspace.CanBeAccessedBy(userResult.Value!.Id))
            return Result.Failure<(DomainUserEntity, Workspace)>(WorkspaceException.UnauthorizedAccess);

        return Result.Success((userResult.Value, workspace));
    }
}