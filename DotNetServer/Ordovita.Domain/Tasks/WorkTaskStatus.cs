using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Workspace;

namespace Ordovita.Domain.Tasks;

public sealed class WorkTaskStatus : Entity<TaskStatusId>
{
    public WorkspaceId WorkspaceId { get; private set; }
    public UserId CreatedBy { get; private set; }
    public string Name { get; private set; } = null!;
    public string Color { get; private set; } = null!;
    public bool IsDefault { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private WorkTaskStatus()
    {
    }

    public static Result<WorkTaskStatus> Create(
        WorkspaceId workspaceId,
        UserId createdBy,
        string name,
        string color)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<WorkTaskStatus>(TaskStatusExceptions.MissingName);
        if (string.IsNullOrWhiteSpace(color))
            return Result.Failure<WorkTaskStatus>(TaskStatusExceptions.MissingColor);

        var now = DateTime.UtcNow;
        return Result.Success(new WorkTaskStatus
        {
            Id = TaskStatusId.New(),
            WorkspaceId = workspaceId,
            CreatedBy = createdBy,
            Name = name,
            Color = color,
            IsDefault = false,
            CreatedAt = now,
            UpdatedAt = now
        });
    }

    public static WorkTaskStatus CreateDefault(WorkspaceId workspaceId, UserId createdBy, string name, string color)
    {
        var now = DateTime.UtcNow;
        return new WorkTaskStatus
        {
            Id = TaskStatusId.New(),
            WorkspaceId = workspaceId,
            CreatedBy = createdBy,
            Name = name,
            Color = color,
            IsDefault = true,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public Result Edit(string name, string color)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure(TaskStatusExceptions.MissingName);
        if (string.IsNullOrWhiteSpace(color))
            return Result.Failure(TaskStatusExceptions.MissingColor);

        Name = name;
        Color = color;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public bool BelongsToWorkspace(WorkspaceId workspaceId)
    {
        return WorkspaceId == workspaceId;
    }
}