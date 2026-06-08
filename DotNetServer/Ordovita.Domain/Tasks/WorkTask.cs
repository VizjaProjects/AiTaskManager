using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Workspace;

namespace Ordovita.Domain.Tasks;

public sealed class WorkTask : AggregateRoot<TaskId>
{
    public WorkspaceId WorkspaceId { get; private set; }
    public UserId CreatedBy { get; private set; }
    public string Title { get; private set; } = null!;
    public string? Description { get; private set; }
    public TaskPriority Priority { get; private set; }
    public TaskCategoryId? CategoryId { get; private set; }
    public int EstimatedDuration { get; private set; }
    public DateTime? DueDateTime { get; private set; }
    public TaskStatusId StatusId { get; private set; }
    public TaskSource Source { get; private set; }
    public bool Accepted { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private WorkTask()
    {
    }

    public static Result<WorkTask> Create(
        WorkspaceId workspaceId,
        UserId createdBy,
        string title,
        string? description,
        TaskPriority priority,
        TaskCategoryId? categoryId,
        int estimatedDuration,
        DateTime? dueDateTime,
        TaskStatusId statusId,
        TaskSource source)
    {
        if (string.IsNullOrWhiteSpace(title))
            return Result.Failure<WorkTask>(TaskExceptions.MissingTitle);
        if (statusId.Value == Guid.Empty)
            return Result.Failure<WorkTask>(TaskExceptions.MissingStatus);

        var accepted = source != TaskSource.AI_PARSED;
        var now = DateTime.UtcNow;

        return Result.Success(new WorkTask
        {
            Id = TaskId.New(),
            WorkspaceId = workspaceId,
            CreatedBy = createdBy,
            Title = title,
            Description = description,
            Priority = priority,
            CategoryId = categoryId,
            EstimatedDuration = estimatedDuration,
            DueDateTime = dueDateTime,
            StatusId = statusId,
            Source = source,
            Accepted = accepted,
            CreatedAt = now,
            UpdatedAt = now
        });
    }

    public Result Edit(
        string title,
        string? description,
        TaskPriority priority,
        TaskCategoryId? categoryId,
        int estimatedDuration,
        DateTime? dueDateTime,
        TaskStatusId statusId)
    {
        if (string.IsNullOrWhiteSpace(title))
            return Result.Failure(TaskExceptions.MissingTitle);
        if (statusId.Value == Guid.Empty)
            return Result.Failure(TaskExceptions.MissingStatus);

        Title = title;
        Description = description;
        Priority = priority;
        CategoryId = categoryId;
        EstimatedDuration = estimatedDuration;
        DueDateTime = dueDateTime;
        StatusId = statusId;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public void Accept()
    {
        Accepted = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ClearDueDateTime()
    {
        DueDateTime = null;
        UpdatedAt = DateTime.UtcNow;
    }

    public void EditDueDateTime(DateTime newDueDateTime)
    {
        DueDateTime = newDueDateTime;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool BelongsToWorkspace(WorkspaceId workspaceId)
    {
        return WorkspaceId == workspaceId;
    }
}