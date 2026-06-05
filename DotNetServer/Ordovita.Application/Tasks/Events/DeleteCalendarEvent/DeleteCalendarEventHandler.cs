using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.Events.DeleteCalendarEvent;

public sealed record DeleteCalendarEventCommand(Guid WorkspaceId, Guid EventId) : ICommand<Unit>;

public sealed class DeleteCalendarEventHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkCalendarRepository calendarRepository,
    ICalendarEventRepository eventRepository,
    IWorkTaskRepository taskRepository,
    IUnitOfWork uow) : ICommandHandler<DeleteCalendarEventCommand, Unit>
{
    public async Task<Result<Unit>> Handle(DeleteCalendarEventCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<Unit>(access.Error);

        var calendar = await calendarRepository.GetPrimaryByWorkspaceIdAsync(
            WorkspaceId.From(command.WorkspaceId), ct);
        if (calendar is null)
            return Result.Failure<Unit>(CalendarExceptions.NotFound);

        var calendarEvent = await eventRepository.GetByIdAsync(EventId.From(command.EventId), ct);
        if (calendarEvent is null || calendarEvent.CalendarId != calendar.Id)
            return Result.Failure<Unit>(EventExceptions.NotFound);

        if (calendarEvent.TaskId is { } linkedTaskId)
        {
            var task = await taskRepository.GetByIdAsync(linkedTaskId, ct);
            if (task is not null)
                task.ClearDueDateTime();
        }

        eventRepository.Delete(calendarEvent);
        await uow.SaveChangesAsync(ct);
        return Result.Success(Unit.Value);
    }
}

public sealed class DeleteCalendarEventValidator : FluentValidation.AbstractValidator<DeleteCalendarEventCommand>
{
    public DeleteCalendarEventValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.EventId).NotEmpty();
    }
}
