namespace Ordovita.Application.Abstraction.Jobs;

public interface IBackgroundJobScheduler
{
    void EnqueueSendConfirmationEmail(string aspUserId, string email, string confirmationLink);

    void EnqueueSendPasswordResetEmail(string aspUserId, string email, string resetCode);

    void EnqueueCommentMentionEmail(
        Guid workspaceId,
        Guid taskId,
        Guid commentId,
        Guid recipientUserId,
        Guid mentionedByUserId);
}