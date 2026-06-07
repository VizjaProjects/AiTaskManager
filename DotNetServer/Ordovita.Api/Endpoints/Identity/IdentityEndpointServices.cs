namespace Ordovita.Api.Endpoints.Identity;

public static class IdentityEndpointServices
{
    public static IServiceCollection AddIdentityEndpointServices(this IServiceCollection services)
    {
        return services.AddScoped<IdentityTokenIssuer>();
    }
}