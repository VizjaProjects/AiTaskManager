using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Workspaces;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Workspace;
using Ordovita.Domain.Workspace.Exception;
using Ordovita.Domain.Workspace.port;

namespace Ordovita.Application.Workspaces.AssignUsersToWorkspace;

public sealed class AssignUsersToWorkspaceHandler(
    IUserContext userContext,
    IUserRepository userRepository,
    IWorkspaceRepository workspaceRepository,
    IUnitOfWork uow) : ICommandHandler<AssignUsersToWorkspaceCommand, WorkspaceDto>
{
    public async Task<Result<WorkspaceDto>> Handle(AssignUsersToWorkspaceCommand command, CancellationToken ct)
    {
        var userResult = await WorkspaceUserResolver.GetCurrentDomainUserAsync(userContext, userRepository, ct);
        if (userResult.IsFailure)
            return Result.Failure<WorkspaceDto>(userResult.Error);

        var workspace = await workspaceRepository.GetByIdAsync(WorkspaceId.From(command.WorkspaceId), ct);
        if (workspace is null)
            return Result.Failure<WorkspaceDto>(WorkspaceException.NotFound);

        var addResult = workspace.AddUserToWorkspace(
            command.UserIds.Select(UserId.From),
            userResult.Value!.Id);

        if (addResult.IsFailure)
            return Result.Failure<WorkspaceDto>(addResult.Error);

        await uow.SaveChangesAsync(ct);
        return Result.Success(await WorkspaceMapper.ToDtoAsync(workspace, userRepository, ct));
    }
}