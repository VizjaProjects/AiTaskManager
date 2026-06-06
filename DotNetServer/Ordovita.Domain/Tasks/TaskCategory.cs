using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Workspace;

namespace Ordovita.Domain.Tasks;

public sealed class TaskCategory : Entity<TaskCategoryId>
{
    public WorkspaceId WorkspaceId { get; private set; }
    public UserId CreatedBy { get; private set; }
    public string Name { get; private set; } = null!;
    public string Color { get; private set; } = null!;
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private TaskCategory()
    {
    }

    public static Result<TaskCategory> Create(
        WorkspaceId workspaceId,
        UserId createdBy,
        string name,
        string color)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<TaskCategory>(CategoryExceptions.MissingName);
        if (string.IsNullOrWhiteSpace(color))
            return Result.Failure<TaskCategory>(CategoryExceptions.MissingColor);

        var now = DateTime.UtcNow;
        return Result.Success(new TaskCategory
        {
            Id = TaskCategoryId.New(),
            WorkspaceId = workspaceId,
            CreatedBy = createdBy,
            Name = name,
            Color = color,
            CreatedAt = now,
            UpdatedAt = now
        });
    }

    public Result Edit(string name, string color)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure(CategoryExceptions.MissingName);
        if (string.IsNullOrWhiteSpace(color))
            return Result.Failure(CategoryExceptions.MissingColor);

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