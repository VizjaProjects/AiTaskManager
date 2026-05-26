using Ordovita.Api.Endpoints.Identity;
using Ordovita.Infrastructure.Identity;

namespace Ordovita.Api.Endpoints;

public static class ApiEndpointsExtensions
{
    public static IEndpointRouteBuilder MapApiEndpoints(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/api/v1");


        api.MapAspIdentityApi();
        return app;
    }
}