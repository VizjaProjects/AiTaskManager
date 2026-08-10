using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.Comments.DeleteComment;

public sealed record DeleteCommentCommand(Guid WorkspaceId, Guid TaskId, Guid CommentId) : ICommand<Unit>;

public sealed class DeleteCommentHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkTaskRepository taskRepository,
    IUnitOfWork uow) : ICommandHandler<DeleteCommentCommand, Unit>
{
    public async Task<Result<Unit>> Handle(DeleteCommentCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<Unit>(access.Error);

        var task = await taskRepository.GetByIdAsync(TaskId.From(command.TaskId), ct);
        if (task is null || !task.BelongsToWorkspace(WorkspaceId.From(command.WorkspaceId)))
            return Result.Failure<Unit>(TaskExceptions.NotFound);

        var result = task.RemoveComment(CommentId.From(command.CommentId), access.Value.User.Id);
        if (result.IsFailure)
            return Result.Failure<Unit>(result.Error);

        await uow.SaveChangesAsync(ct);
        return Result.Success(Unit.Value);
    }
}

public sealed class DeleteCommentValidator : AbstractValidator<DeleteCommentCommand>
{
    public DeleteCommentValidator()
    {
        RuleFor(command => command.WorkspaceId).NotEmpty();
        RuleFor(command => command.TaskId).NotEmpty();
        RuleFor(command => command.CommentId).NotEmpty();
    }
}