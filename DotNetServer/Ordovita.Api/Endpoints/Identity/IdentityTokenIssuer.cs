using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Ordovita.Domain.Identity;
using Ordovita.Infrastructure.Identity;

namespace Ordovita.Api.Endpoints.Identity;

public sealed class IdentityTokenIssuer(
    SignInManager<AspIdentityUser> signInManager,
    TimeProvider timeProvider,
    IOptionsMonitor<BearerTokenOptions> bearerTokenOptions)
{
    public async Task<TokenPair> IssueAsync(
        AspIdentityUser aspUser, string? domainRole = null, CancellationToken ct = default)
    {
        var principal = await signInManager.CreateUserPrincipalAsync(aspUser);

        if (!string.IsNullOrWhiteSpace(domainRole) && principal.Identity is ClaimsIdentity identity)
        {
            foreach (var claim in identity.FindAll(identity.RoleClaimType).ToList())
                identity.RemoveClaim(claim);

            identity.AddClaim(new Claim(identity.RoleClaimType, domainRole));
        }

        var scheme = IdentityConstants.BearerScheme;
        var options = bearerTokenOptions.Get(scheme);

        var accessExpires = timeProvider.GetUtcNow().Add(options.BearerTokenExpiration);
        var accessProperties = new AuthenticationProperties { ExpiresUtc = accessExpires };
        var accessTicket = new AuthenticationTicket(principal, accessProperties, scheme);
        var accessToken = options.BearerTokenProtector.Protect(accessTicket);

        var refreshExpires = timeProvider.GetUtcNow().Add(options.RefreshTokenExpiration);
        var refreshProperties = new AuthenticationProperties { ExpiresUtc = refreshExpires };
        var refreshTicket = new AuthenticationTicket(principal, refreshProperties, scheme);
        var refreshToken = options.RefreshTokenProtector.Protect(refreshTicket);

        return new TokenPair(accessToken, refreshToken);
    }

    public static LoginUserInfo ToUserInfo(Ordovita.Domain.Identity.DomainUser domainUser)
    {
        return new LoginUserInfo(
            domainUser.Id.Value,
            domainUser.Email.Value,
            domainUser.FullName,
            domainUser.Role.ToString());
    }
}

public sealed record TokenPair(string AccessToken, string RefreshToken);

public sealed record LoginUserInfo(Guid UserId, string Email, string FullName, string Role);

public sealed record LoginResponse(
    string AccessToken,
    string RefreshToken,
    Guid UserId,
    string Email,
    string FullName,
    string Role);

public sealed record RegisterResponse(Guid UserId);

public sealed record RefreshTokenResponse(string AccessToken, string RefreshToken);

public sealed record CurrentUserResponse(
    Guid UserId,
    string Email,
    string FullName,
    string Role);