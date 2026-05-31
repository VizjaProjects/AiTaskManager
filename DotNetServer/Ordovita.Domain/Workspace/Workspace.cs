using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Workspace.Exception;

namespace Ordovita.Domain.Workspace;

public class Workspace : AggregateRoot<WorkspaceId>
{
    private readonly HashSet<WorkspaceUser> _assignedUsers = [];

    public string WorkspaceName { get; private set; } = null!;
    public UserId CreatedBy { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    public IReadOnlySet<WorkspaceUser> AssignedUsers => _assignedUsers;

    private Workspace()
    {
    }

    public static Result<Workspace> Create(
        string workspaceName,
        IEnumerable<UserId>? assignedUsers,
        UserId createdBy)
    {
        if (string.IsNullOrWhiteSpace(workspaceName))
            return Result.Failure<Workspace>(WorkspaceException.MissingWorkspaceName);
        if (createdBy.Value == Guid.Empty)
            return Result.Failure<Workspace>(WorkspaceException.MissingCreateByUser);

        var workspace = new Workspace
        {
            Id = WorkspaceId.New(),
            WorkspaceName = workspaceName,
            CreatedBy = createdBy,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        foreach (var userId in assignedUsers ?? [])
            workspace._assignedUsers.Add(WorkspaceUser.Create(workspace.Id, userId));

        if (workspace._assignedUsers.All(u => u.UserId != createdBy))
            workspace._assignedUsers.Add(WorkspaceUser.Create(workspace.Id, createdBy));

        return Result.Success(workspace);
    }

    public Result AddUserToWorkspace(IEnumerable<UserId> usersToAssign, UserId performingUserId)
    {
        if (performingUserId != CreatedBy)
            return Result.Failure(WorkspaceException.UnauthorizedAccess);

        var newUsers = usersToAssign.ToHashSet();
        if (newUsers.Count == 0)
            return Result.Success();

        if (newUsers.Any(u => _assignedUsers.Any(wu => wu.UserId == u)))
            return Result.Failure(WorkspaceException.AlreadyAssigned);

        foreach (var userId in newUsers)
            _assignedUsers.Add(WorkspaceUser.Create(Id, userId));

        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result RemoveUserFromWorkspace(IEnumerable<UserId> usersToRemove, UserId performingUserId)
    {
        if (performingUserId != CreatedBy)
            return Result.Failure(WorkspaceException.UnauthorizedAccess);

        var toRemove = usersToRemove.ToHashSet();
        if (toRemove.Count == 0)
            return Result.Success();

        if (!toRemove.Any(u => _assignedUsers.Any(wu => wu.UserId == u)))
            return Result.Failure(WorkspaceException.UserNotFound);

        _assignedUsers.RemoveWhere(wu => toRemove.Contains(wu.UserId));
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public bool CanBeAccessedBy(UserId userId) =>
        CreatedBy == userId || _assignedUsers.Any(u => u.UserId == userId);
}
