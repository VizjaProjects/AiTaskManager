using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks.Exception;

namespace Ordovita.Domain.Tasks;

public sealed class CalendarEvent : Entity<EventId>
{
    public TaskId? TaskId { get; private set; }
    public string Title { get; private set; } = null!;
    public DateTime StartDateTime { get; private set; }
    public DateTime EndDateTime { get; private set; }
    public bool AllDay { get; private set; }
    public EventStatus Status { get; private set; }
    public ProposedBy ProposedBy { get; private set; }
    public CalendarId CalendarId { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private CalendarEvent()
    {
    }

    public static Result<CalendarEvent> Create(
        TaskId? taskId,
        string title,
        DateTime startDateTime,
        DateTime endDateTime,
        bool allDay,
        ProposedBy proposedBy,
        CalendarId calendarId)
    {
        if (string.IsNullOrWhiteSpace(title))
            return Result.Failure<CalendarEvent>(EventExceptions.MissingTitle);

        var status = proposedBy == ProposedBy.AI ? EventStatus.PROPOSED : EventStatus.ACCEPTED;
        var now = DateTime.UtcNow;

        return Result.Success(new CalendarEvent
        {
            Id = EventId.New(),
            TaskId = taskId,
            Title = title,
            StartDateTime = startDateTime,
            EndDateTime = endDateTime,
            AllDay = allDay,
            Status = status,
            ProposedBy = proposedBy,
            CalendarId = calendarId,
            CreatedAt = now,
            UpdatedAt = now
        });
    }

    public Result Edit(
        string title,
        DateTime startDateTime,
        DateTime endDateTime,
        bool allDay,
        EventStatus status)
    {
        if (string.IsNullOrWhiteSpace(title))
            return Result.Failure(EventExceptions.MissingTitle);

        Title = title;
        StartDateTime = startDateTime;
        EndDateTime = endDateTime;
        AllDay = allDay;
        Status = status;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public void Accept()
    {
        Status = EventStatus.ACCEPTED;
        UpdatedAt = DateTime.UtcNow;
    }
}
