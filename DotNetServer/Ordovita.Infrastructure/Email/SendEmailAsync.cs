using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using MimeKit;
using Ordovita.Application.Abstraction.Email;

namespace Ordovita.Infrastructure.Email;

public sealed class SendEmailAsync(IOptions<EmailOptions> emailOptions) : ISendEmailAsync
{
    private readonly EmailOptions _emailOptions = emailOptions.Value;

    public async Task SendAsync(string to, string subject, string html, CancellationToken cancellationToken = default)
    {
        using var client = new SmtpClient();
        client.CheckCertificateRevocation = false;
        await client.ConnectAsync(_emailOptions.Host, _emailOptions.Port, MailKit.Security.SecureSocketOptions.Auto,
            cancellationToken);
        if (!string.IsNullOrEmpty(_emailOptions.Username))
            await client.AuthenticateAsync(_emailOptions.Username, _emailOptions.Password, cancellationToken);

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_emailOptions.FromName, _emailOptions.FromAddress));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = html };
        await client.SendAsync(message, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);
    }
}