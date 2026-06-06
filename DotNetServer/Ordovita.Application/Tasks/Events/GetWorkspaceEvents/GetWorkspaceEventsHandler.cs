using FluentValidation;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.Events.GetWorkspaceEvents;

public sealed record GetWorkspaceEventsQuery(Guid WorkspaceId) : IQuery<IReadOnlyList<CalendarEventDto>>;

public sealed class GetWorkspaceEventsHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkCalendarRepository calendarRepository,
    ICalendarEventRepository eventRepository) : IQueryHandler<GetWorkspaceEventsQuery, IReadOnlyList<CalendarEventDto>>
{
    public async Task<Result<IReadOnlyList<CalendarEventDto>>> Handle(GetWorkspaceEventsQuery query,
        CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(query.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<IReadOnlyList<CalendarEventDto>>(access.Error);

        var calendar = await calendarRepository.GetPrimaryByWorkspaceIdAsync(
            WorkspaceId.From(query.WorkspaceId), ct);
        if (calendar is null)
            return Result.Failure<IReadOnlyList<CalendarEventDto>>(CalendarExceptions.NotFound);

        var events = await eventRepository.GetByCalendarIdAsync(calendar.Id, ct);
        var visible = events
            .Where(e => e.Status != EventStatus.PROPOSED)
            .Select(TaskMapper.ToDto)
            .ToList();

        return Result.Success<IReadOnlyList<CalendarEventDto>>(visible);
    }
}

public sealed class GetWorkspaceEventsValidator : AbstractValidator<GetWorkspaceEventsQuery>
{
    public GetWorkspaceEventsValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
    }
}