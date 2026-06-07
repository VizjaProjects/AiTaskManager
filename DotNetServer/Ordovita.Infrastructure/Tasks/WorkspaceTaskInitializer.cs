using Ordovita.Domain.Identity;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Infrastructure.Tasks;

public sealed class WorkspaceTaskInitializer(
    IWorkCalendarRepository calendarRepository,
    IWorkTaskStatusRepository statusRepository) : IWorkspaceTaskInitializer
{
    public async Task InitializeAsync(WorkspaceId workspaceId, UserId createdBy, CancellationToken ct = default)
    {
        var calendar = await calendarRepository.GetByUserIdAsync(workspaceId, ct);
        if (calendar is null) await calendarRepository.AddAsync(WorkCalendar.CreatePrimary(workspaceId), ct);

        var existingStatuses = await statusRepository.GetByWorkspaceIdAsync(workspaceId, ct);
        if (existingStatuses.Count > 0)
            return;

        var defaultStatuses = new[]
        {
            WorkTaskStatus.CreateDefault(workspaceId, createdBy, "To Do", "#3B82F6"),
            WorkTaskStatus.CreateDefault(workspaceId, createdBy, "In Progress", "#F59E0B"),
            WorkTaskStatus.CreateDefault(workspaceId, createdBy, "Completed", "#10B981"),
            WorkTaskStatus.CreateDefault(workspaceId, createdBy, "Cancelled", "#EF4444")
        };

        await statusRepository.AddRangeAsync(defaultStatuses, ct);
    }
}