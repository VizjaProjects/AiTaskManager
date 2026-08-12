using Hangfire;
using Microsoft.Extensions.Options;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Tasks.Comments.SendEmailNotification;
using Ordovita.Domain.Common;
using Ordovita.Infrastructure.Identity;

namespace Ordovita.Infrastructure.Jobs;

public sealed class CommentMentionEmailJob(ISender sender, IOptions<OAuth2Options> oauth2Options)
{
    public async Task SendAsync(
        Guid workspaceId,
        Guid taskId,
        Guid commentId,
        Guid recipientUserId,
        Guid mentionedByUserId)
    {
        var taskLink = oauth2Options.Value.FrontendUrl.TrimEnd('/') + "/tasks";
        var result = await sender.Send(
            new SendEmailNotificationCommand(
                taskId,
                recipientUserId,
                workspaceId,
                commentId,
                mentionedByUserId,
                taskLink));

        if (result.IsFailure &&
            result.Error.Type is not ErrorType.NotFound and not ErrorType.Unauthorized)
            throw new InvalidOperationException(result.Error.Description);
    }
}
