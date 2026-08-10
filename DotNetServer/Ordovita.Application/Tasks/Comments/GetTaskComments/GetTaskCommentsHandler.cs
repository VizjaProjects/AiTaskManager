using FluentValidation;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.Comments.GetTaskComments;

public sealed record GetTaskCommentsQuery(Guid WorkspaceId, Guid TaskId) : IQuery<IReadOnlyList<TaskCommentDto>>;

public sealed class GetTaskCommentsHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkTaskRepository taskRepository,
    IUserRepository userRepository) : IQueryHandler<GetTaskCommentsQuery, IReadOnlyList<TaskCommentDto>>
{
    public async Task<Result<IReadOnlyList<TaskCommentDto>>> Handle(GetTaskCommentsQuery query, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(query.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<IReadOnlyList<TaskCommentDto>>(access.Error);

        var task = await taskRepository.GetByIdAsync(TaskId.From(query.TaskId), ct);
        if (task is null || !task.BelongsToWorkspace(WorkspaceId.From(query.WorkspaceId)))
            return Result.Failure<IReadOnlyList<TaskCommentDto>>(TaskExceptions.NotFound);

        var authorIds = task.Comments.Select(comment => comment.AuthorId).Distinct().ToList();
        var authors = authorIds.Count == 0
            ? []
            : await userRepository.GetAsyncByIds(authorIds, ct);
        var authorById = authors.ToDictionary(author => author.Id);

        var comments = task.Comments
            .OrderBy(comment => comment.CreatedAt)
            .Select(comment =>
            {
                authorById.TryGetValue(comment.AuthorId, out var author);
                return TaskCommentMapper.ToDto(
                    comment,
                    author?.FullName ?? "Unknown",
                    author?.Email.Value);
            })
            .ToList();

        return Result.Success<IReadOnlyList<TaskCommentDto>>(comments);
    }
}

public sealed class GetTaskCommentsValidator : AbstractValidator<GetTaskCommentsQuery>
{
    public GetTaskCommentsValidator()
    {
        RuleFor(query => query.WorkspaceId).NotEmpty();
        RuleFor(query => query.TaskId).NotEmpty();
    }
}