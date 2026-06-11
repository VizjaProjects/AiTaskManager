using Ordovita.Domain.Tasks;

namespace Ordovita.Application.Tasks;

public sealed record WorkTaskDto(
    Guid TaskId,
    Guid WorkspaceId,
    Guid CreatedBy,
    string Title,
    string? Description,
    TaskPriority Priority,
    Guid? CategoryId,
    int EstimatedDuration,
    DateTime? DueDateTime,
    Guid StatusId,
    TaskSource Source,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed record CreateWorkTaskResult(Guid TaskId, DateTime CreatedAt);

public sealed record EditWorkTaskResult(Guid TaskId, DateTime UpdatedAt);

public sealed record TaskCategoryDto(
    Guid CategoryId,
    Guid WorkspaceId,
    string Name,
    string Color,
    Guid CreatedBy,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed record CreateTaskCategoryResult(Guid CategoryId, DateTime CreatedAt);

public sealed record EditTaskCategoryResult(
    Guid CategoryId,
    string Name,
    string Color,
    DateTime UpdatedAt);

public sealed record WorkTaskStatusDto(
    Guid StatusId,
    Guid WorkspaceId,
    string Name,
    string Color,
    bool IsDefault,
    Guid CreatedBy,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed record CreateWorkTaskStatusResult(Guid StatusId, DateTime CreatedAt);

public sealed record EditWorkTaskStatusResult(
    Guid StatusId,
    string Name,
    string Color,
    DateTime UpdatedAt);

public sealed record CalendarEventDto(
    Guid EventId,
    Guid? TaskId,
    string Title,
    DateTime StartDateTime,
    DateTime EndDateTime,
    bool AllDay,
    EventStatus Status,
    ProposedBy ProposedBy,
    Guid CalendarId,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed record CreateCalendarEventResult(Guid EventId, DateTime CreatedAt);

public sealed record EditCalendarEventResult(Guid EventId, DateTime UpdatedAt);

public sealed record PendingWorkTaskDto(
    Guid TaskId,
    string Title,
    string? Description,
    TaskPriority Priority,
    Guid? CategoryId,
    int EstimatedDuration,
    DateTime? DueDateTime,
    Guid StatusId,
    TaskSource Source,
    DateTime CreatedAt);

public sealed record PendingCalendarEventDto(
    Guid EventId,
    Guid? TaskId,
    string Title,
    DateTime StartDateTime,
    DateTime EndDateTime,
    bool AllDay,
    ProposedBy ProposedBy,
    DateTime CreatedAt);

public sealed record PendingProposalsDto(
    IReadOnlyList<PendingWorkTaskDto> Tasks,
    IReadOnlyList<PendingCalendarEventDto> Events);

public sealed record AcceptAiTaskResult(Guid TaskId, DateTime UpdatedAt);

public sealed record AcceptAiEventResult(Guid EventId, DateTime UpdatedAt);

public static class TaskMapper
{
    public static WorkTaskDto ToDto(WorkTask task)
    {
        return new WorkTaskDto(
            task.Id.Value,
            task.WorkspaceId.Value,
            task.CreatedBy.Value,
            task.Title,
            task.Description,
            task.Priority,
            task.CategoryId?.Value,
            task.EstimatedDuration,
            task.DueDateTime,
            task.StatusId.Value,
            task.Source,
            task.CreatedAt,
            task.UpdatedAt);
    }

    public static TaskCategoryDto ToDto(TaskCategory category)
    {
        return new TaskCategoryDto(
            category.Id.Value,
            category.WorkspaceId.Value,
            category.Name,
            category.Color,
            category.CreatedBy.Value,
            category.CreatedAt,
            category.UpdatedAt);
    }

    public static WorkTaskStatusDto ToDto(WorkTaskStatus status)
    {
        return new WorkTaskStatusDto(
            status.Id.Value,
            status.WorkspaceId.Value,
            status.Name,
            status.Color,
            status.IsDefault,
            status.CreatedBy.Value,
            status.CreatedAt,
            status.UpdatedAt);
    }

    public static CalendarEventDto ToDto(CalendarEvent calendarEvent)
    {
        return new CalendarEventDto(
            calendarEvent.Id.Value,
            calendarEvent.TaskId?.Value,
            calendarEvent.Title,
            calendarEvent.StartDateTime,
            calendarEvent.EndDateTime,
            calendarEvent.AllDay,
            calendarEvent.Status,
            calendarEvent.ProposedBy,
            calendarEvent.CalendarId.Value,
            calendarEvent.CreatedAt,
            calendarEvent.UpdatedAt);
    }

    public static PendingWorkTaskDto ToPendingDto(WorkTask task)
    {
        return new PendingWorkTaskDto(
            task.Id.Value,
            task.Title,
            task.Description,
            task.Priority,
            task.CategoryId?.Value,
            task.EstimatedDuration,
            task.DueDateTime,
            task.StatusId.Value,
            task.Source,
            task.CreatedAt);
    }

    public static PendingCalendarEventDto ToPendingDto(CalendarEvent calendarEvent)
    {
        return new PendingCalendarEventDto(
            calendarEvent.Id.Value,
            calendarEvent.TaskId?.Value,
            calendarEvent.Title,
            calendarEvent.StartDateTime,
            calendarEvent.EndDateTime,
            calendarEvent.AllDay,
            calendarEvent.ProposedBy,
            calendarEvent.CreatedAt);
    }
}