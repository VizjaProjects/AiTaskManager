using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using MimeKit;
using Ordovita.Application.Abstraction.Email;
using Ordovita.Infrastructure.Identity;

namespace Ordovita.Infrastructure.Email;

public class SmtpIdentityEmailSender(
    IOptions<EmailOptions> emailOptions,
    IEmailTemplateRenderer templates) : IEmailSender<AspIdentityUser>
{
    private readonly EmailOptions _emailOptions = emailOptions.Value;

    public async Task SendConfirmationLinkAsync(AspIdentityUser user, string email, string confirmationLink)
    {
        var html = await templates.RenderAsync(
            "registered-verification-email.html",
            new Dictionary<string, string>
            {
                ["fullName"] = string.IsNullOrWhiteSpace(user.UserName) ? "" : $" {user.UserName}",
                ["email"] = email,
                ["confirmationLink"] = confirmationLink
            });
        await SendAsync(email, "Potwierdź rejestrację w Ordovita", html);
    }

    public Task SendPasswordResetLinkAsync(
        AspIdentityUser user, string email, string resetLink)
    {
        return SendPasswordResetCodeAsync(user, email, resetLink);
    }


    public async Task SendPasswordResetCodeAsync(AspIdentityUser user, string email, string resetCode)
    {
        var html = await templates.RenderAsync(
            "remind-password-email.html",
            new Dictionary<string, string>
            {
                ["email"] = email,
                ["code"] = resetCode,
                ["createdTime"] = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
            });
        await SendAsync(email, "Ustaw lub zresetuj hasło — Ordovita", html);
    }

    private async Task SendAsync(string to, string subject, string html)
    {
        using var client = new SmtpClient();
        client.CheckCertificateRevocation = false;
        await client.ConnectAsync(_emailOptions.Host, _emailOptions.Port);
        if (!string.IsNullOrEmpty(_emailOptions.Username))
            await client.AuthenticateAsync(_emailOptions.Username, _emailOptions.Password);

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_emailOptions.FromName, _emailOptions.FromAddress));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = html };
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
