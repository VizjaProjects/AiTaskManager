using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Plan;
using Ordovita.Application.Workspaces;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;
using Ordovita.Domain.Workspace.port;
using Action = Ordovita.Application.Plan.Action;

namespace Ordovita.Application.Workspaces.CreateWorkspace;

public sealed class CreateWorkspaceHandler(
    IUserContext userContext,
    IUserRepository userRepository,
    IWorkspaceRepository workspaceRepository,
    IWorkspaceTaskInitializer workspaceTaskInitializer,
    PlanLimitChecker planLimitChecker,
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
        
        var limitCheckResult = await CheckLimits(command.Visibility, ct);

        if (limitCheckResult.IsFailure)
        {
            return Result.Failure<WorkspaceDto>(limitCheckResult.Error);
        }

        var workspaceResult = Workspace.Create(
            command.WorkspaceName, assignedUsers, userResult.Value!.Id, command.Visibility);
        if (workspaceResult.IsFailure)
            return Result.Failure<WorkspaceDto>(workspaceResult.Error);

        var creator = await userRepository.GetAsyncById(workspaceResult.Value!.CreatedBy, ct);
        if (creator is null)
        {
            return Result.Failure<WorkspaceDto>(Error.NotFound("User.NotFound", "Workspace creator not found."));
        }

        if (creator.DefaultWorkspaceId is null || creator.DefaultWorkspaceId.Value.Value == Guid.Empty)
        {
            creator.SetupDefaultWorkspace(workspaceResult.Value.Id);
        }

        var workspace = workspaceResult.Value!;
        await workspaceRepository.AddAsync(workspace, ct);
        await workspaceTaskInitializer.InitializeAsync(workspace.Id, userResult.Value.Id, ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success(await WorkspaceMapper.ToDtoAsync(workspace, userRepository, ct));
    }


    private async Task<Result> CheckLimits(WorkspaceVisibility visibility, CancellationToken ct)
    {
        if (visibility == WorkspaceVisibility.Private)
        {
            var limitCheckResult = await planLimitChecker.Check(Action.CreatePrivateWorkspace, ct);

            if (limitCheckResult.IsFailure || !limitCheckResult.Value)
            {
                return Result.Failure(Error.LimitExceeded("Workspace.PrivateLimitExceeded", "Private workspace limit exceeded for your current plan."));
            }
        
            return Result.Success();
        }
    
        if (visibility == WorkspaceVisibility.Public)
        {
            var limitCheckResult = await planLimitChecker.Check(Action.CreatePublicWorkspace, ct);

            if (limitCheckResult.IsFailure || !limitCheckResult.Value)
            {
                return Result.Failure(Error.LimitExceeded("Workspace.PublicLimitExceeded", "Public workspace limit exceeded for your current plan."));
            }
        
            return Result.Success(); 
        }

        return Result.Failure(Error.NotFound("CreateWorkspaceHandler", "WorkspaceVisibility not found."));
    }
}