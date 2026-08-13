using Hangfire.Dashboard;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace Ordovita.Api.Common;

internal sealed class HangfireDashboardAuthorizationFilter(bool isDevelopment) : IDashboardAuthorizationFilter
{
    public const string CookieName = "hangfire";

    public bool Authorize(DashboardContext context)
    {
        var http = context.GetHttpContext();
        if (!http.Request.Cookies.TryGetValue(CookieName, out var token) || string.IsNullOrWhiteSpace(token))
            return false;

        var protector = http.RequestServices.GetRequiredService<IOptionsMonitor<BearerTokenOptions>>()
            .Get(IdentityConstants.BearerScheme).BearerTokenProtector;
        var ticket = protector.Unprotect(token);

        if (ticket?.Principal is not { Identity.IsAuthenticated: true } principal)
            return false;

        if (ticket.Properties.ExpiresUtc is { } expires && DateTimeOffset.UtcNow >= expires)
            return false;




        return principal.IsInRole("ADMIN");
    }
}