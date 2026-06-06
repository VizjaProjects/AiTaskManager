using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Workspaces;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Workspace;
using Ordovita.Domain.Workspace.Exception;
using Ordovita.Domain.Workspace.port;

namespace Ordovita.Application.Workspaces.RemoveUsersFromWorkspace;

public sealed class RemoveUsersFromWorkspaceHandler(
    IUserContext userContext,
    IUserRepository userRepository,
    IWorkspaceRepository workspaceRepository,
    IUnitOfWork uow) : ICommandHandler<RemoveUsersFromWorkspaceCommand, WorkspaceDto>
{
    public async Task<Result<WorkspaceDto>> Handle(RemoveUsersFromWorkspaceCommand command, CancellationToken ct)
    {
        var userResult = await WorkspaceUserResolver.GetCurrentDomainUserAsync(userContext, userRepository, ct);
        if (userResult.IsFailure)
            return Result.Failure<WorkspaceDto>(userResult.Error);

        var workspace = await workspaceRepository.GetByIdAsync(WorkspaceId.From(command.WorkspaceId), ct);
        if (workspace is null)
            return Result.Failure<WorkspaceDto>(WorkspaceException.NotFound);

        var removeResult = workspace.RemoveUserFromWorkspace(
            command.UserIds.Select(UserId.From),
            userResult.Value!.Id);

        if (removeResult.IsFailure)
            return Result.Failure<WorkspaceDto>(removeResult.Error);

        await uow.SaveChangesAsync(ct);
        return Result.Success(WorkspaceMapper.ToDto(workspace));
    }
}