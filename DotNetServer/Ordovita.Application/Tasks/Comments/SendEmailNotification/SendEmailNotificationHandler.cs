using System.Net;
using Ordovita.Application.Abstraction.Email;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Identity.Exception;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;
using Ordovita.Domain.Workspace.Exception;
using Ordovita.Domain.Workspace.port;

namespace Ordovita.Application.Tasks.Comments.SendEmailNotification;

public sealed record SendEmailNotificationCommand(
    Guid WorkTaskId,
    Guid UserToSendId,
    Guid WorkspaceId,
    Guid CommentId,
    Guid MentionedByUserId,
    string TaskLink) : ICommand<Unit>;

public sealed class SendEmailNotificationHandler(
    IUserRepository userRepository,
    IWorkspaceRepository workspaceRepository,
    IWorkTaskRepository workTaskRepository,
    ISendEmailAsync sendEmailAsync,
    IEmailTemplateRenderer templates) : ICommandHandler<SendEmailNotificationCommand, Unit>
{
    public async Task<Result<Unit>> Handle(SendEmailNotificationCommand command, CancellationToken ct)
    {
        if (command.UserToSendId == command.MentionedByUserId)
            return Result.Success(Unit.Value);

        var workspace = await workspaceRepository.GetByIdAsync(WorkspaceId.From(command.WorkspaceId), ct);
        if (workspace is null)
            return Result.Failure<Unit>(WorkspaceException.NotFound);

        var task = await workTaskRepository.GetByIdAsync(TaskId.From(command.WorkTaskId), ct);
        if (task is null || !task.BelongsToWorkspace(WorkspaceId.From(command.WorkspaceId)))
            return Result.Failure<Unit>(TaskExceptions.NotFound);

        var comment = task.Comments.FirstOrDefault(c => c.Id.Value == command.CommentId);
        if (comment is null)
            return Result.Failure<Unit>(TaskCommentExceptions.NotFound);

        var targetUser = await userRepository.GetAsyncById(UserId.From(command.UserToSendId), ct);
        if (targetUser is null)
            return Result.Failure<Unit>(UserException.NotFound);

        if (!targetUser.IsEnable || !workspace.CanBeAccessedBy(targetUser.Id))
            return Result.Success(Unit.Value);

        var mentionedBy = await userRepository.GetAsyncById(UserId.From(command.MentionedByUserId), ct);
        if (mentionedBy is null)
            return Result.Failure<Unit>(UserException.NotFound);

        var html = await templates.RenderAsync(
            "notifcation-command-email.html",
            new Dictionary<string, string>
            {
                ["fullName"] = string.IsNullOrWhiteSpace(targetUser.FullName)
                    ? ""
                    : $" {WebUtility.HtmlEncode(targetUser.FullName)}",
                ["mentionedByName"] = WebUtility.HtmlEncode(mentionedBy.FullName),
                ["taskTitle"] = WebUtility.HtmlEncode(task.Title),
                ["commentContent"] = WebUtility.HtmlEncode(comment.Content),
                ["taskLink"] = WebUtility.HtmlEncode(command.TaskLink)
            });

        await sendEmailAsync.SendAsync(
            targetUser.Email.Value,
            "Wspomniano o Tobie w komentarzu",
            html,
            ct);

        return Result.Success(Unit.Value);
    }
}