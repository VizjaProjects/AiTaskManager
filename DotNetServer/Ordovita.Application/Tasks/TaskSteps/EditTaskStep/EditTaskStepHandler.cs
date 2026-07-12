using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.TaskSteps.EditTaskStep;

public sealed record EditTaskStepCommand(
    Guid WorkspaceId,
    Guid TaskId,
    Guid StepId,
    string Title,
    Guid? AssignedUserId) : ICommand<TaskStepDto>;

public sealed class EditTaskStepHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkTaskRepository taskRepository,
    IUnitOfWork uow) : ICommandHandler<EditTaskStepCommand, TaskStepDto>
{
    public async Task<Result<TaskStepDto>> Handle(EditTaskStepCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<TaskStepDto>(access.Error);

        var task = await taskRepository.GetByIdAsync(TaskId.From(command.TaskId), ct);
        if (task is null || !task.BelongsToWorkspace(WorkspaceId.From(command.WorkspaceId)))
            return Result.Failure<TaskStepDto>(TaskExceptions.NotFound);

        var assignedUserId = ResolveAssignee(command.AssignedUserId, access.Value.Workspace);
        if (command.AssignedUserId.HasValue && !assignedUserId.HasValue)
            return Result.Failure<TaskStepDto>(TaskExceptions.AssigneeNotWorkspaceMember);

        var result = task.UpdateStep(TaskStepId.From(command.StepId), command.Title, assignedUserId);
        if (result.IsFailure || result.Value is null)
            return Result.Failure<TaskStepDto>(result.Error);

        await uow.SaveChangesAsync(ct);
        return Result.Success(TaskMapper.ToDto(result.Value));
    }

    private static UserId? ResolveAssignee(Guid? requestedUserId, Workspace workspace)
    {
        if (!requestedUserId.HasValue)
            return null;

        var userId = UserId.From(requestedUserId.Value);
        return workspace.AssignedUsers.Any(member => member.UserId == userId) ? userId : null;
    }
}

public sealed class EditTaskStepValidator : AbstractValidator<EditTaskStepCommand>
{
    public EditTaskStepValidator()
    {
        RuleFor(command => command.WorkspaceId).NotEmpty();
        RuleFor(command => command.TaskId).NotEmpty();
        RuleFor(command => command.StepId).NotEmpty();
        RuleFor(command => command.Title).NotEmpty().MaximumLength(WorkTask.StepTitleMaxLength);
        RuleFor(command => command.AssignedUserId).NotEqual(Guid.Empty).When(command => command.AssignedUserId.HasValue);
    }
}
