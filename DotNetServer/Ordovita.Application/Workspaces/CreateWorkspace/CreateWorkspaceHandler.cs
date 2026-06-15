using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Workspaces;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;
using Ordovita.Domain.Workspace.port;

namespace Ordovita.Application.Workspaces.CreateWorkspace;

public sealed class CreateWorkspaceHandler(
    IUserContext userContext,
    IUserRepository userRepository,
    IWorkspaceRepository workspaceRepository,
    IWorkspaceTaskInitializer workspaceTaskInitializer,
    IUnitOfWork uow) : ICommandHandler<CreateWorkspaceCommand, WorkspaceDto>
{
    public async Task<Result<WorkspaceDto>> Handle(CreateWorkspaceCommand command, CancellationToken ct)
    {
        var userResult = await WorkspaceUserResolver.GetCurrentDomainUserAsync(userContext, userRepository, ct);
        if (userResult.IsFailure)
            return Result.Failure<WorkspaceDto>(userResult.Error);

        var assignedUsers = command.AssignedUserIds?
            .Select(UserId.From)
            .ToList();

        var workspaceResult = Workspace.Create(
            command.WorkspaceName, assignedUsers, userResult.Value!.Id, command.Visibility);
        if (workspaceResult.IsFailure)
            return Result.Failure<WorkspaceDto>(workspaceResult.Error);

        var creator = await userRepository.GetAsyncById(workspaceResult.Value!.CreatedBy, ct);

        // First workspace becomes the user's default (no default set yet).
        if (creator!.DefaultWorkspaceId is null ||
            creator.DefaultWorkspaceId.Value.Value == Guid.Empty)
            creator.SetupDefaultWorkspace(workspaceResult.Value.Id);

        var workspace = workspaceResult.Value!;
        await workspaceRepository.AddAsync(workspace, ct);
        await workspaceTaskInitializer.InitializeAsync(workspace.Id, userResult.Value.Id, ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success(await WorkspaceMapper.ToDtoAsync(workspace, userRepository, ct));
    }
}