using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.Events.EditCalendarEvent;

public sealed record EditCalendarEventCommand(
    Guid WorkspaceId,
    Guid EventId,
    string Title,
    DateTime StartDateTime,
    DateTime EndDateTime,
    bool AllDay,
    EventStatus Status) : ICommand<EditCalendarEventResult>;

public sealed class EditCalendarEventHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkCalendarRepository calendarRepository,
    ICalendarEventRepository eventRepository,
    IUnitOfWork uow) : ICommandHandler<EditCalendarEventCommand, EditCalendarEventResult>
{
    public async Task<Result<EditCalendarEventResult>> Handle(EditCalendarEventCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<EditCalendarEventResult>(access.Error);

        var calendar = await calendarRepository.GetPrimaryByWorkspaceIdAsync(
            WorkspaceId.From(command.WorkspaceId), ct);
        if (calendar is null)
            return Result.Failure<EditCalendarEventResult>(CalendarExceptions.NotFound);

        var calendarEvent = await eventRepository.GetByIdAsync(EventId.From(command.EventId), ct);
        if (calendarEvent is null || calendarEvent.CalendarId != calendar.Id)
            return Result.Failure<EditCalendarEventResult>(EventExceptions.NotFound);

        var editResult = calendarEvent.Edit(
            command.Title, command.StartDateTime, command.EndDateTime, command.AllDay, command.Status);
        if (editResult.IsFailure)
            return Result.Failure<EditCalendarEventResult>(editResult.Error);

        await uow.SaveChangesAsync(ct);
        return Result.Success(new EditCalendarEventResult(calendarEvent.Id.Value, calendarEvent.UpdatedAt));
    }
}

public sealed class EditCalendarEventValidator : FluentValidation.AbstractValidator<EditCalendarEventCommand>
{
    public EditCalendarEventValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.EventId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Status).IsInEnum();
    }
}
