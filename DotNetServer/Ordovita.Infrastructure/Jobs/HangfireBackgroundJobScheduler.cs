using Hangfire;
using Ordovita.Application.Abstraction.Jobs;

namespace Ordovita.Infrastructure.Jobs;

public sealed class HangfireBackgroundJobScheduler(IBackgroundJobClient jobs) : IBackgroundJobScheduler
{
    public void EnqueueSendConfirmationEmail(string aspUserId, string email, string confirmationLink)
    {
        jobs.Enqueue<IdentityEmailJob>(job => job.SendConfirmationAsync(aspUserId, email, confirmationLink));
    }

    public void EnqueueSendPasswordResetEmail(string aspUserId, string email, string resetCode)
    {
        jobs.Enqueue<IdentityEmailJob>(job => job.SendPasswordResetAsync(aspUserId, email, resetCode));
    }

    public void EnqueueCommentMentionEmail(
        Guid workspaceId,
        Guid taskId,
        Guid commentId,
        Guid recipientUserId,
        Guid mentionedByUserId)
    {
        jobs.Enqueue<CommentMentionEmailJob>(job =>
            job.SendAsync(workspaceId, taskId, commentId, recipientUserId, mentionedByUserId));
    }
}