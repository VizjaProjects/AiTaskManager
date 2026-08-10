using Ordovita.Domain.Tasks;

namespace Ordovita.Application.Tasks;

public sealed record TaskCommentDto(
    Guid CommentId,
    Guid TaskId,
    Guid AuthorId,
    string AuthorName,
    string? AuthorEmail,
    string Content,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public static class TaskCommentMapper
{
    public static TaskCommentDto ToDto(TaskComment comment, string authorName, string? authorEmail)
    {
        return new TaskCommentDto(
            comment.Id.Value,
            comment.TaskId.Value,
            comment.AuthorId.Value,
            authorName,
            authorEmail,
            comment.Content,
            comment.CreatedAt,
            comment.UpdatedAt);
    }
}