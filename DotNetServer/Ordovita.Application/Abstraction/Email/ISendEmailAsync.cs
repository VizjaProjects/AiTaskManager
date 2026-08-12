namespace Ordovita.Application.Abstraction.Email;

public interface ISendEmailAsync
{
    Task SendAsync(string to, string subject, string html, CancellationToken cancellationToken = default);
}