using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.WorkTasks.AssignUsersToTask;

public sealed record SetTaskAssigneesCommand(
    Guid WorkspaceId,
    Guid TaskId,
    IReadOnlyList<Guid> UserIds) : ICommand<EditWorkTaskResult>;

public sealed class SetTaskAssigneesHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkTaskRepository taskRepository,
    IUnitOfWork uow) : ICommandHandler<SetTaskAssigneesCommand, EditWorkTaskResult>
{
    public async Task<Result<EditWorkTaskResult>> Handle(SetTaskAssigneesCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<EditWorkTaskResult>(access.Error);

        var (_, workspace) = access.Value;
        var workspaceId = WorkspaceId.From(command.WorkspaceId);

        var task = await taskRepository.GetByIdAsync(TaskId.From(command.TaskId), ct);
        if (task is null || !task.BelongsToWorkspace(workspaceId))
            return Result.Failure<EditWorkTaskResult>(TaskExceptions.NotFound);

        var requestedUserIds = command.UserIds
            .Select(UserId.From)
            .ToHashSet();

        var memberIds = workspace.AssignedUsers.Select(u => u.UserId).ToHashSet();
        if (requestedUserIds.Any(id => !memberIds.Contains(id)))
            return Result.Failure<EditWorkTaskResult>(TaskExceptions.AssigneeNotWorkspaceMember);

        var setResult = task.SetAssignees(requestedUserIds);
        if (setResult.IsFailure)
            return Result.Failure<EditWorkTaskResult>(setResult.Error);

        await uow.SaveChangesAsync(ct);

        return Result.Success(new EditWorkTaskResult(task.Id.Value, task.UpdatedAt));
    }
}

public sealed class SetTaskAssigneesValidator : AbstractValidator<SetTaskAssigneesCommand>
{
    public SetTaskAssigneesValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.TaskId).NotEmpty();
        RuleFor(x => x.UserIds).NotNull();
    }
}