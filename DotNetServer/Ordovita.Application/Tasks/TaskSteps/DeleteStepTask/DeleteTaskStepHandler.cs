using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.TaskSteps.DeleteTaskStep;

public sealed record DeleteTaskStepCommand(Guid WorkspaceId, Guid TaskId, Guid StepId) : ICommand<Unit>;

public sealed class DeleteTaskStepHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkTaskRepository taskRepository,
    IUnitOfWork uow) : ICommandHandler<DeleteTaskStepCommand, Unit>
{
    public async Task<Result<Unit>> Handle(DeleteTaskStepCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<Unit>(access.Error);

        var task = await taskRepository.GetByIdAsync(TaskId.From(command.TaskId), ct);
        if (task is null || !task.BelongsToWorkspace(WorkspaceId.From(command.WorkspaceId)))
            return Result.Failure<Unit>(TaskExceptions.NotFound);

        var result = task.RemoveStep(TaskStepId.From(command.StepId));
        if (result.IsFailure)
            return Result.Failure<Unit>(result.Error);

        await uow.SaveChangesAsync(ct);
        return Result.Success(Unit.Value);
    }
}

public sealed class DeleteTaskStepValidator : AbstractValidator<DeleteTaskStepCommand>
{
    public DeleteTaskStepValidator()
    {
        RuleFor(command => command.WorkspaceId).NotEmpty();
        RuleFor(command => command.TaskId).NotEmpty();
        RuleFor(command => command.StepId).NotEmpty();
    }
}
