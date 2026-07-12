using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.TaskSteps.SetTaskStepCompletion;

public sealed record SetTaskStepCompletionCommand(
    Guid WorkspaceId,
    Guid TaskId,
    Guid StepId,
    bool Completed) : ICommand<TaskStepDto>;

public sealed class SetTaskStepCompletionHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkTaskRepository taskRepository,
    IUnitOfWork uow) : ICommandHandler<SetTaskStepCompletionCommand, TaskStepDto>
{
    public async Task<Result<TaskStepDto>> Handle(SetTaskStepCompletionCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<TaskStepDto>(access.Error);

        var task = await taskRepository.GetByIdAsync(TaskId.From(command.TaskId), ct);
        if (task is null || !task.BelongsToWorkspace(WorkspaceId.From(command.WorkspaceId)))
            return Result.Failure<TaskStepDto>(TaskExceptions.NotFound);
        if (!task.Accepted)
            return Result.Failure<TaskStepDto>(TaskStepExceptions.PendingTaskCannotBeCompleted);

        var result = task.SetStepCompleted(TaskStepId.From(command.StepId), command.Completed);
        if (result.IsFailure || result.Value is null)
            return Result.Failure<TaskStepDto>(result.Error);

        await uow.SaveChangesAsync(ct);
        return Result.Success(TaskMapper.ToDto(result.Value));
    }
}

public sealed class SetTaskStepCompletionValidator : AbstractValidator<SetTaskStepCompletionCommand>
{
    public SetTaskStepCompletionValidator()
    {
        RuleFor(command => command.WorkspaceId).NotEmpty();
        RuleFor(command => command.TaskId).NotEmpty();
        RuleFor(command => command.StepId).NotEmpty();
    }
}
