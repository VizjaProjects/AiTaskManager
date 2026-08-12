using Microsoft.AspNetCore.Identity;
using Ordovita.Infrastructure.Identity;

namespace Ordovita.Infrastructure.Jobs;

public sealed class IdentityEmailJob(
    IEmailSender<AspIdentityUser> emailSender,
    UserManager<AspIdentityUser> userManager)
{
    public async Task SendConfirmationAsync(string aspUserId, string email, string confirmationLink)
    {
        var user = await userManager.FindByIdAsync(aspUserId)
                   ?? throw new InvalidOperationException($"User {aspUserId} not found.");

        await emailSender.SendConfirmationLinkAsync(user, email, confirmationLink);
    }

    public async Task SendPasswordResetAsync(string aspUserId, string email, string resetCode)
    {
        var user = await userManager.FindByIdAsync(aspUserId)
                   ?? throw new InvalidOperationException($"User {aspUserId} not found.");

        await emailSender.SendPasswordResetCodeAsync(user, email, resetCode);
    }
}