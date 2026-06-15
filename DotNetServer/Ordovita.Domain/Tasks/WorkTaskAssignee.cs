using Ordovita.Domain.Identity;

namespace Ordovita.Domain.Tasks;

public class WorkTaskAssignee
{
    public TaskId TaskId { get; private set; }
    public UserId UserId { get; private set; }
    public DateTime AssignedAt { get; private set; }

    private WorkTaskAssignee()
    {
    }

    public static WorkTaskAssignee Create(TaskId taskId, UserId userId)
    {
        return new WorkTaskAssignee
        {
            TaskId = taskId,
            UserId = userId,
            AssignedAt = DateTime.UtcNow
        };
    }
}
