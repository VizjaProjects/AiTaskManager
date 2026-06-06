using Ordovita.Domain.Identity;
using Ordovita.Domain.Workspace;

namespace Ordovita.Domain.Tasks.port;

public interface IWorkTaskRepository
{
    Task AddAsync(WorkTask task, CancellationToken ct = default);
    Task<WorkTask?> GetByIdAsync(TaskId id, CancellationToken ct = default);

    Task<IReadOnlyList<WorkTask>>
        GetAcceptedByWorkspaceIdAsync(WorkspaceId workspaceId, CancellationToken ct = default);

    Task<IReadOnlyList<WorkTask>> GetPendingByWorkspaceIdAsync(WorkspaceId workspaceId, CancellationToken ct = default);
    void Delete(WorkTask task);
}

public interface ITaskCategoryRepository
{
    Task<TaskCategory> AddAsync(TaskCategory category, CancellationToken ct = default);
    Task<TaskCategory?> GetByIdAsync(TaskCategoryId id, CancellationToken ct = default);
    Task<int> CountByWorkspaceIdAsync(WorkspaceId workspaceId, CancellationToken ct = default);
    Task<IReadOnlyList<TaskCategory>> GetByWorkspaceIdAsync(WorkspaceId workspaceId, CancellationToken ct = default);
    void Delete(TaskCategory category);
}

public interface IWorkTaskStatusRepository
{
    Task AddAsync(WorkTaskStatus status, CancellationToken ct = default);
    Task AddRangeAsync(IEnumerable<WorkTaskStatus> statuses, CancellationToken ct = default);
    Task<WorkTaskStatus?> GetByIdAsync(TaskStatusId id, CancellationToken ct = default);
    Task<IReadOnlyList<WorkTaskStatus>> GetByWorkspaceIdAsync(WorkspaceId workspaceId, CancellationToken ct = default);
    void Delete(WorkTaskStatus status);
}

public interface IWorkCalendarRepository
{
    Task<WorkCalendar?> GetByUserIdAsync(WorkspaceId workspaceId, CancellationToken ct = default);
    Task AddAsync(WorkCalendar calendar, CancellationToken ct = default);
    Task<WorkCalendar?> GetPrimaryByWorkspaceIdAsync(WorkspaceId workspaceId, CancellationToken ct = default);
}

public interface ICalendarEventRepository
{
    Task AddAsync(CalendarEvent calendarEvent, CancellationToken ct = default);
    Task<CalendarEvent?> GetByIdAsync(EventId id, CancellationToken ct = default);
    Task<CalendarEvent?> GetByTaskIdAsync(TaskId taskId, CancellationToken ct = default);
    Task<IReadOnlyList<CalendarEvent>> GetByTaskIdAllAsync(TaskId taskId, CancellationToken ct = default);
    Task<IReadOnlyList<CalendarEvent>> GetByCalendarIdAsync(CalendarId calendarId, CancellationToken ct = default);

    Task<IReadOnlyList<CalendarEvent>> GetProposedByCalendarIdAsync(CalendarId calendarId,
        CancellationToken ct = default);

    void Delete(CalendarEvent calendarEvent);
}

public interface IWorkspaceTaskInitializer
{
    Task InitializeAsync(WorkspaceId workspaceId, UserId createdBy, CancellationToken ct = default);
}