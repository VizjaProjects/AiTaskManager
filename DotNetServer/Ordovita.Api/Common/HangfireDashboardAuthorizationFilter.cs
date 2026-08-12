using Hangfire.Dashboard;

namespace Ordovita.Api.Common;

internal sealed class HangfireDashboardAuthorizationFilter(bool isDevelopment) : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        if (isDevelopment)
            return true;

        var user = context.GetHttpContext().User;
        return user.Identity?.IsAuthenticated == true && user.IsInRole("ADMIN");
    }
}