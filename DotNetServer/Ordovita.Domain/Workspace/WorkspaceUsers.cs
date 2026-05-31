using Ordovita.Domain.Identity;

namespace Ordovita.Domain.Workspace;

public class WorkspaceUser
{
    public WorkspaceId WorkspaceId { get; private set; }
    public UserId UserId { get; private set; }
    public DateTime AssignedAt { get; private set; }

    private WorkspaceUser()
    {
    }

    public static WorkspaceUser Create(WorkspaceId workspaceId, UserId userId)
    {
        return new WorkspaceUser { WorkspaceId = workspaceId, UserId = userId, AssignedAt = DateTime.UtcNow };
    }
}