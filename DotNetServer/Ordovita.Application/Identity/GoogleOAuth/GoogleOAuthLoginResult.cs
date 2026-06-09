namespace Ordovita.Application.Identity.GoogleOAuth;

public sealed record GoogleOAuthLoginResult(
    string AspIdentityUserId,
    Guid UserId,
    string Email,
    string FullName,
    string Role);
