using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.Events.CreateCalendarEvent;

public sealed record CreateCalendarEventCommand(
    Guid WorkspaceId,
    Guid? TaskId,
    string Title,
    DateTime StartDateTime,
    DateTime EndDateTime,
    bool AllDay,
    ProposedBy ProposedBy) : ICommand<CreateCalendarEventResult>;

public sealed class CreateCalendarEventHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkCalendarRepository calendarRepository,
    ICalendarEventRepository eventRepository,
    IWorkTaskRepository taskRepository,
    IUnitOfWork uow) : ICommandHandler<CreateCalendarEventCommand, CreateCalendarEventResult>
{
    public async Task<Result<CreateCalendarEventResult>> Handle(CreateCalendarEventCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<CreateCalendarEventResult>(access.Error);

        var workspaceId = WorkspaceId.From(command.WorkspaceId);
        var calendar = await calendarRepository.GetPrimaryByWorkspaceIdAsync(workspaceId, ct);
        if (calendar is null)
            return Result.Failure<CreateCalendarEventResult>(CalendarExceptions.NotFound);

        TaskId? taskId = null;
        if (command.TaskId is { } taskIdValue)
        {
            var task = await taskRepository.GetByIdAsync(TaskId.From(taskIdValue), ct);
            if (task is null || !task.BelongsToWorkspace(workspaceId))
                return Result.Failure<CreateCalendarEventResult>(TaskExceptions.NotFound);
            taskId = task.Id;
        }

        var eventResult = CalendarEvent.Create(
            taskId,
            command.Title,
            command.StartDateTime,
            command.EndDateTime,
            command.AllDay,
            command.ProposedBy,
            calendar.Id);

        if (eventResult.IsFailure)
            return Result.Failure<CreateCalendarEventResult>(eventResult.Error);

        await eventRepository.AddAsync(eventResult.Value!, ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success(new CreateCalendarEventResult(
            eventResult.Value!.Id.Value, eventResult.Value.CreatedAt));
    }
}

public sealed class CreateCalendarEventValidator : FluentValidation.AbstractValidator<CreateCalendarEventCommand>
{
    public CreateCalendarEventValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ProposedBy).IsInEnum();
    }
}
