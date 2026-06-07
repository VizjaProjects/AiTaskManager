namespace Ordovita.Api.Endpoints.Identity;

public static class IdentityEndpointServices
{
    public static IServiceCollection AddIdentityEndpointServices(this IServiceCollection services) =>
        services.AddScoped<IdentityTokenIssuer>();
}
