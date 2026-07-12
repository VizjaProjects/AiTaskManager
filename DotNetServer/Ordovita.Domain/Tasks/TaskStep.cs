using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Tasks.Exception;

namespace Ordovita.Domain.Tasks;

public sealed class TaskStep : Entity<TaskStepId>
{
    public TaskId TaskId { get; private set; }
    public string Title { get; private set; } = null!;
    public int Position { get; private set; }
    public bool Completed { get; private set; }
    public UserId? AssignedUserId { get; private set; }
    public UserId CreatedBy { get; private set; }
    public TaskSource Source { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private TaskStep()
    {
    }

    internal static Result<TaskStep> Create(
        TaskId taskId,
        UserId createdBy,
        string title,
        int position,
        TaskSource source,
        UserId? assignedUserId = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            return Result.Failure<TaskStep>(TaskStepExceptions.MissingTitle);
        if (title.Trim().Length > WorkTask.StepTitleMaxLength)
            return Result.Failure<TaskStep>(TaskStepExceptions.TitleTooLong);

        var now = DateTime.UtcNow;
        return Result.Success(new TaskStep
        {
            Id = TaskStepId.New(),
            TaskId = taskId,
            Title = title.Trim(),
            Position = position,
            Completed = false,
            AssignedUserId = assignedUserId,
            CreatedBy = createdBy,
            Source = source,
            CreatedAt = now,
            UpdatedAt = now
        });
    }

    internal Result Update(string title, UserId? assignedUserId)
    {
        if (string.IsNullOrWhiteSpace(title))
            return Result.Failure(TaskStepExceptions.MissingTitle);
        if (title.Trim().Length > WorkTask.StepTitleMaxLength)
            return Result.Failure(TaskStepExceptions.TitleTooLong);

        Title = title.Trim();
        AssignedUserId = assignedUserId;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    internal void SetCompleted(bool completed)
    {
        if (Completed == completed)
            return;

        Completed = completed;
        UpdatedAt = DateTime.UtcNow;
    }

    internal void SetPosition(int position)
    {
        if (Position == position)
            return;

        Position = position;
        UpdatedAt = DateTime.UtcNow;
    }
}
