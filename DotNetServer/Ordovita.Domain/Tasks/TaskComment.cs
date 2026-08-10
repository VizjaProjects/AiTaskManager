using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Tasks.Exception;

namespace Ordovita.Domain.Tasks;

public sealed class TaskComment : Entity<CommentId>
{
    public TaskId TaskId { get; private set; }
    public UserId AuthorId { get; private set; }
    public string Content { get; private set; } = null!;
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private TaskComment()
    {
    }

    internal static Result<TaskComment> Create(TaskId taskId, UserId authorId, string content)
    {
        if (string.IsNullOrWhiteSpace(content))
            return Result.Failure<TaskComment>(TaskCommentExceptions.MissingContent);
        if (content.Trim().Length > WorkTask.CommentMaxLength)
            return Result.Failure<TaskComment>(TaskCommentExceptions.ContentTooLong);

        var now = DateTime.UtcNow;
        return Result.Success(new TaskComment
        {
            Id = CommentId.New(),
            TaskId = taskId,
            AuthorId = authorId,
            Content = content.Trim(),
            CreatedAt = now,
            UpdatedAt = now
        });
    }

    internal Result Edit(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
            return Result.Failure(TaskCommentExceptions.MissingContent);
        if (content.Trim().Length > WorkTask.CommentMaxLength)
            return Result.Failure(TaskCommentExceptions.ContentTooLong);

        Content = content.Trim();
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }
}