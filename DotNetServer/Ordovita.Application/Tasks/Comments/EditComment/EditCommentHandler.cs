using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.Comments.EditComment;

public sealed record EditCommentCommand(
    Guid WorkspaceId,
    Guid TaskId,
    Guid CommentId,
    string Content) : ICommand<TaskCommentDto>;

public sealed class EditCommentHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkTaskRepository taskRepository,
    IUnitOfWork uow) : ICommandHandler<EditCommentCommand, TaskCommentDto>
{
    public async Task<Result<TaskCommentDto>> Handle(EditCommentCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<TaskCommentDto>(access.Error);

        var task = await taskRepository.GetByIdAsync(TaskId.From(command.TaskId), ct);
        if (task is null || !task.BelongsToWorkspace(WorkspaceId.From(command.WorkspaceId)))
            return Result.Failure<TaskCommentDto>(TaskExceptions.NotFound);

        var result = task.EditComment(CommentId.From(command.CommentId), access.Value.User.Id, command.Content);
        if (result.IsFailure || result.Value is null)
            return Result.Failure<TaskCommentDto>(result.Error);

        await uow.SaveChangesAsync(ct);

        var author = access.Value.User;
        return Result.Success(TaskCommentMapper.ToDto(result.Value, author.FullName, author.Email.Value));
    }
}

public sealed class EditCommentValidator : AbstractValidator<EditCommentCommand>
{
    public EditCommentValidator()
    {
        RuleFor(command => command.WorkspaceId).NotEmpty();
        RuleFor(command => command.TaskId).NotEmpty();
        RuleFor(command => command.CommentId).NotEmpty();
        RuleFor(command => command.Content).NotEmpty().MaximumLength(WorkTask.CommentMaxLength);
    }
}