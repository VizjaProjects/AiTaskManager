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

        var workspaceResult = Workspace.Create(command.WorkspaceName, assignedUsers, userResult.Value!.Id);
        if (workspaceResult.IsFailure)
            return Result.Failure<WorkspaceDto>(workspaceResult.Error);

        var workspace = workspaceResult.Value!;
        await workspaceRepository.AddAsync(workspace, ct);
        await workspaceTaskInitializer.InitializeAsync(workspace.Id, userResult.Value.Id, ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success(WorkspaceMapper.ToDto(workspace));
    }
}