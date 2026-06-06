using Ordovita.Domain.Common;
using Ordovita.Domain.Workspace;

namespace Ordovita.Domain.Tasks;

public sealed class WorkCalendar : Entity<CalendarId>
{
    public WorkspaceId WorkspaceId { get; private set; }
    public bool IsPrimary { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private WorkCalendar()
    {
    }

    public static WorkCalendar CreatePrimary(WorkspaceId workspaceId)
    {
        var now = DateTime.UtcNow;
        return new WorkCalendar
        {
            Id = CalendarId.New(),
            WorkspaceId = workspaceId,
            IsPrimary = true,
            CreatedAt = now,
            UpdatedAt = now
        };
    }
}