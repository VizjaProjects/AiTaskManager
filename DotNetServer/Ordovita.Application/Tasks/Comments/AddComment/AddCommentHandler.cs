using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.Comments.AddComment;

public sealed record AddCommentCommand(
    Guid WorkspaceId,
    Guid TaskId,
    string Content) : ICommand<TaskCommentDto>;

public sealed class AddCommentHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkTaskRepository taskRepository,
    IUnitOfWork uow) : ICommandHandler<AddCommentCommand, TaskCommentDto>
{
    public async Task<Result<TaskCommentDto>> Handle(AddCommentCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<TaskCommentDto>(access.Error);

        var task = await taskRepository.GetByIdAsync(TaskId.From(command.TaskId), ct);
        if (task is null || !task.BelongsToWorkspace(WorkspaceId.From(command.WorkspaceId)))
            return Result.Failure<TaskCommentDto>(TaskExceptions.NotFound);

        var result = task.AddComment(access.Value.User.Id, command.Content);
        if (result.IsFailure || result.Value is null)
            return Result.Failure<TaskCommentDto>(result.Error);

        await uow.SaveChangesAsync(ct);

        var author = access.Value.User;
        return Result.Success(TaskCommentMapper.ToDto(result.Value, author.FullName, author.Email.Value));
    }
}

public sealed class AddCommentValidator : AbstractValidator<AddCommentCommand>
{
    public AddCommentValidator()
    {
        RuleFor(command => command.WorkspaceId).NotEmpty();
        RuleFor(command => command.TaskId).NotEmpty();
        RuleFor(command => command.Content).NotEmpty().MaximumLength(WorkTask.CommentMaxLength);
    }
}