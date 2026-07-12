using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.TaskSteps.ReorderTaskSteps;

public sealed record ReorderTaskStepsCommand(
    Guid WorkspaceId,
    Guid TaskId,
    IReadOnlyList<Guid> StepIds) : ICommand<IReadOnlyList<TaskStepDto>>;

public sealed class ReorderTaskStepsHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkTaskRepository taskRepository,
    IUnitOfWork uow) : ICommandHandler<ReorderTaskStepsCommand, IReadOnlyList<TaskStepDto>>
{
    public async Task<Result<IReadOnlyList<TaskStepDto>>> Handle(
        ReorderTaskStepsCommand command,
        CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<IReadOnlyList<TaskStepDto>>(access.Error);

        var task = await taskRepository.GetByIdAsync(TaskId.From(command.TaskId), ct);
        if (task is null || !task.BelongsToWorkspace(WorkspaceId.From(command.WorkspaceId)))
            return Result.Failure<IReadOnlyList<TaskStepDto>>(TaskExceptions.NotFound);

        var result = task.ReorderSteps(command.StepIds.Select(TaskStepId.From).ToList());
        if (result.IsFailure || result.Value is null)
            return Result.Failure<IReadOnlyList<TaskStepDto>>(result.Error);

        await uow.SaveChangesAsync(ct);
        return Result.Success<IReadOnlyList<TaskStepDto>>(result.Value.Select(TaskMapper.ToDto).ToList());
    }
}

public sealed class ReorderTaskStepsValidator : AbstractValidator<ReorderTaskStepsCommand>
{
    public ReorderTaskStepsValidator()
    {
        RuleFor(command => command.WorkspaceId).NotEmpty();
        RuleFor(command => command.TaskId).NotEmpty();
        RuleFor(command => command.StepIds).NotNull();
        RuleForEach(command => command.StepIds).NotEmpty();
    }
}
