using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Workspaces;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Workspace;
using Ordovita.Domain.Workspace.Exception;
using Ordovita.Domain.Workspace.port;

namespace Ordovita.Application.Workspaces.DeleteWorkspace;

public sealed class DeleteWorkspaceHandler(
    IUserContext userContext,
    IUserRepository userRepository,
    IWorkspaceRepository workspaceRepository,
    IUnitOfWork uow) : ICommandHandler<DeleteWorkspaceCommand, Unit>
{
    public async Task<Result<Unit>> Handle(DeleteWorkspaceCommand command, CancellationToken ct)
    {
        var userResult = await WorkspaceUserResolver.GetCurrentDomainUserAsync(userContext, userRepository, ct);
        if (userResult.IsFailure)
            return Result.Failure<Unit>(userResult.Error);

        var workspace = await workspaceRepository.GetByIdAsync(WorkspaceId.From(command.WorkspaceId), ct);
        if (workspace is null)
            return Result.Failure<Unit>(WorkspaceException.NotFound);

        if (workspace.CreatedBy != userResult.Value!.Id)
            return Result.Failure<Unit>(WorkspaceException.UnauthorizedAccess);

        workspaceRepository.Delete(workspace);
        await uow.SaveChangesAsync(ct);

        return Result.Success(Unit.Value);
    }
}
