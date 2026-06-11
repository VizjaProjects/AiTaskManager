using Ordovita.Domain.Common;

namespace Ordovita.Application.Abstraction.Identity;

public interface IExternalAuthService
{
    Task<Result<ExternalAuthUser>> FindOrCreateGoogleUserAsync(
        string googleSubject,
        string email,
        string fullName,
        CancellationToken ct = default);
}

public sealed record ExternalAuthUser(
    string AspIdentityUserId,
    Guid DomainUserId,
    string Email,
    string FullName,
    string Role);