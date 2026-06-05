using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.WorkTasks.DeleteWorkTask;

public sealed record DeleteWorkTaskCommand(Guid WorkspaceId, Guid TaskId) : ICommand<Unit>;

public sealed class DeleteWorkTaskHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkTaskRepository taskRepository,
    ICalendarEventRepository eventRepository,
    IUnitOfWork uow) : ICommandHandler<DeleteWorkTaskCommand, Unit>
{
    public async Task<Result<Unit>> Handle(DeleteWorkTaskCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<Unit>(access.Error);

        var workspaceId = WorkspaceId.From(command.WorkspaceId);
        var task = await taskRepository.GetByIdAsync(TaskId.From(command.TaskId), ct);
        if (task is null || !task.BelongsToWorkspace(workspaceId))
            return Result.Failure<Unit>(TaskExceptions.NotFound);

        var events = await eventRepository.GetByTaskIdAllAsync(task.Id, ct);
        foreach (var calendarEvent in events)
            eventRepository.Delete(calendarEvent);

        taskRepository.Delete(task);
        await uow.SaveChangesAsync(ct);
        return Result.Success(Unit.Value);
    }
}

public sealed class DeleteWorkTaskValidator : FluentValidation.AbstractValidator<DeleteWorkTaskCommand>
{
    public DeleteWorkTaskValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.TaskId).NotEmpty();
    }
}
