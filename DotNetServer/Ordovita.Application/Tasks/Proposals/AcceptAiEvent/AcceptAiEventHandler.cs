using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Tasks;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.Proposals.AcceptAiEvent;

public sealed record AcceptAiEventCommand(
    Guid WorkspaceId,
    Guid EventId,
    string Title,
    DateTime StartDateTime,
    DateTime EndDateTime,
    bool AllDay) : ICommand<AcceptAiEventResult>;

public sealed class AcceptAiEventHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkCalendarRepository calendarRepository,
    ICalendarEventRepository eventRepository,
    IUnitOfWork uow) : ICommandHandler<AcceptAiEventCommand, AcceptAiEventResult>
{
    public async Task<Result<AcceptAiEventResult>> Handle(AcceptAiEventCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<AcceptAiEventResult>(access.Error);

        var calendar = await calendarRepository.GetPrimaryByWorkspaceIdAsync(
            WorkspaceId.From(command.WorkspaceId), ct);
        if (calendar is null)
            return Result.Failure<AcceptAiEventResult>(CalendarExceptions.NotFound);

        var calendarEvent = await eventRepository.GetByIdAsync(EventId.From(command.EventId), ct);
        if (calendarEvent is null || calendarEvent.CalendarId != calendar.Id)
            return Result.Failure<AcceptAiEventResult>(EventExceptions.NotFound);
        if (calendarEvent.Status != EventStatus.PROPOSED)
            return Result.Failure<AcceptAiEventResult>(EventExceptions.NotProposed);

        var editResult = calendarEvent.Edit(
            command.Title,
            command.StartDateTime,
            command.EndDateTime,
            command.AllDay,
            EventStatus.ACCEPTED);
        if (editResult.IsFailure)
            return Result.Failure<AcceptAiEventResult>(editResult.Error);

        await uow.SaveChangesAsync(ct);
        return Result.Success(new AcceptAiEventResult(calendarEvent.Id.Value, calendarEvent.UpdatedAt));
    }
}

public sealed class AcceptAiEventValidator : AbstractValidator<AcceptAiEventCommand>
{
    public AcceptAiEventValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.EventId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
    }
}