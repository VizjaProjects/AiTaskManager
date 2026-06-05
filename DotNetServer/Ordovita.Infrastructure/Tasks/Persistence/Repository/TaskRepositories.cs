using Microsoft.EntityFrameworkCore;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;
using Ordovita.Infrastructure.Persistence;

namespace Ordovita.Infrastructure.Tasks.Persistence.Repository;

public sealed class WorkTaskRepository(AppDbContext context) : IWorkTaskRepository
{
    public async Task AddAsync(WorkTask task, CancellationToken ct = default) =>
        await context.WorkTasks.AddAsync(task, ct);

    public async Task<WorkTask?> GetByIdAsync(TaskId id, CancellationToken ct = default) =>
        await context.WorkTasks.FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task<IReadOnlyList<WorkTask>> GetAcceptedByWorkspaceIdAsync(
        WorkspaceId workspaceId, CancellationToken ct = default) =>
        await context.WorkTasks
            .AsNoTracking()
            .Where(t => t.WorkspaceId == workspaceId && t.Accepted)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<WorkTask>> GetPendingByWorkspaceIdAsync(
        WorkspaceId workspaceId, CancellationToken ct = default) =>
        await context.WorkTasks
            .AsNoTracking()
            .Where(t => t.WorkspaceId == workspaceId && !t.Accepted)
            .ToListAsync(ct);

    public void Delete(WorkTask task) => context.WorkTasks.Remove(task);
}

public sealed class TaskCategoryRepository(AppDbContext context) : ITaskCategoryRepository
{
    public async Task AddAsync(TaskCategory category, CancellationToken ct = default) =>
        await context.TaskCategories.AddAsync(category, ct);

    public async Task<TaskCategory?> GetByIdAsync(TaskCategoryId id, CancellationToken ct = default) =>
        await context.TaskCategories.FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<int> CountByWorkspaceIdAsync(WorkspaceId workspaceId, CancellationToken ct = default) =>
        await context.TaskCategories.CountAsync(c => c.WorkspaceId == workspaceId, ct);

    public async Task<IReadOnlyList<TaskCategory>> GetByWorkspaceIdAsync(
        WorkspaceId workspaceId, CancellationToken ct = default) =>
        await context.TaskCategories.AsNoTracking()
            .Where(c => c.WorkspaceId == workspaceId)
            .ToListAsync(ct);

    public void Delete(TaskCategory category) => context.TaskCategories.Remove(category);
}

public sealed class WorkTaskStatusRepository(AppDbContext context) : IWorkTaskStatusRepository
{
    public async Task AddAsync(WorkTaskStatus status, CancellationToken ct = default) =>
        await context.WorkTaskStatuses.AddAsync(status, ct);

    public async Task AddRangeAsync(IEnumerable<WorkTaskStatus> statuses, CancellationToken ct = default) =>
        await context.WorkTaskStatuses.AddRangeAsync(statuses, ct);

    public async Task<WorkTaskStatus?> GetByIdAsync(TaskStatusId id, CancellationToken ct = default) =>
        await context.WorkTaskStatuses.FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task<IReadOnlyList<WorkTaskStatus>> GetByWorkspaceIdAsync(
        WorkspaceId workspaceId, CancellationToken ct = default) =>
        await context.WorkTaskStatuses.AsNoTracking()
            .Where(s => s.WorkspaceId == workspaceId)
            .ToListAsync(ct);

    public void Delete(WorkTaskStatus status) => context.WorkTaskStatuses.Remove(status);
}

public sealed class WorkCalendarRepository(AppDbContext context) : IWorkCalendarRepository
{
    public async Task AddAsync(WorkCalendar calendar, CancellationToken ct = default) =>
        await context.WorkCalendars.AddAsync(calendar, ct);

    public async Task<WorkCalendar?> GetPrimaryByWorkspaceIdAsync(
        WorkspaceId workspaceId, CancellationToken ct = default) =>
        await context.WorkCalendars.FirstOrDefaultAsync(c => c.WorkspaceId == workspaceId && c.IsPrimary, ct);
}

public sealed class CalendarEventRepository(AppDbContext context) : ICalendarEventRepository
{
    public async Task AddAsync(CalendarEvent calendarEvent, CancellationToken ct = default) =>
        await context.CalendarEvents.AddAsync(calendarEvent, ct);

    public async Task<CalendarEvent?> GetByIdAsync(EventId id, CancellationToken ct = default) =>
        await context.CalendarEvents.FirstOrDefaultAsync(e => e.Id == id, ct);

    public async Task<CalendarEvent?> GetByTaskIdAsync(TaskId taskId, CancellationToken ct = default) =>
        await context.CalendarEvents.FirstOrDefaultAsync(e => e.TaskId == taskId, ct);

    public async Task<IReadOnlyList<CalendarEvent>> GetByTaskIdAllAsync(
        TaskId taskId, CancellationToken ct = default) =>
        await context.CalendarEvents.Where(e => e.TaskId == taskId).ToListAsync(ct);

    public async Task<IReadOnlyList<CalendarEvent>> GetByCalendarIdAsync(
        CalendarId calendarId, CancellationToken ct = default) =>
        await context.CalendarEvents.AsNoTracking()
            .Where(e => e.CalendarId == calendarId)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<CalendarEvent>> GetProposedByCalendarIdAsync(
        CalendarId calendarId, CancellationToken ct = default) =>
        await context.CalendarEvents.AsNoTracking()
            .Where(e => e.CalendarId == calendarId && e.Status == EventStatus.PROPOSED)
            .ToListAsync(ct);

    public void Delete(CalendarEvent calendarEvent) => context.CalendarEvents.Remove(calendarEvent);
}
