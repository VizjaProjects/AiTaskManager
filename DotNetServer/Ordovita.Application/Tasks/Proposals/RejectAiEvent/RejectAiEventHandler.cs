using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.Proposals.RejectAiEvent;

public sealed record RejectAiEventCommand(Guid WorkspaceId, Guid EventId) : ICommand<Unit>;

public sealed class RejectAiEventHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkCalendarRepository calendarRepository,
    ICalendarEventRepository eventRepository,
    IUnitOfWork uow) : ICommandHandler<RejectAiEventCommand, Unit>
{
    public async Task<Result<Unit>> Handle(RejectAiEventCommand command, CancellationToken ct)
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
        if (calendarEvent.Status != EventStatus.PROPOSED)
            return Result.Failure<Unit>(EventExceptions.NotProposed);

        eventRepository.Delete(calendarEvent);
        await uow.SaveChangesAsync(ct);
        return Result.Success(Unit.Value);
    }
}

public sealed class RejectAiEventValidator : AbstractValidator<RejectAiEventCommand>
{
    public RejectAiEventValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.EventId).NotEmpty();
    }
}