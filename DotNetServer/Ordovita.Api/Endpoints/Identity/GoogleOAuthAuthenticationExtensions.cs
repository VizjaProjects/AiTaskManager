using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.Extensions.DependencyInjection;
using Ordovita.Infrastructure.Identity;

namespace Ordovita.Api.Endpoints.Identity;

public static class GoogleOAuthAuthenticationExtensions
{
    public static IServiceCollection AddGoogleOAuthAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<GoogleAuthOptions>(configuration.GetSection(GoogleAuthOptions.Section));
        services.Configure<OAuth2Options>(configuration.GetSection(OAuth2Options.Section));

        var (clientId, clientSecret) = ResolveGoogleCredentials(configuration);
        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
            return services;

        services.AddAuthentication()
            .AddCookie(GoogleOAuthConstants.ExternalCookieScheme, options =>
            {
                options.Cookie.Name = "Ordovita.OAuth.External";
                options.Cookie.HttpOnly = true;
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.ExpireTimeSpan = TimeSpan.FromMinutes(10);
            })
            .AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
            {
                options.SignInScheme = GoogleOAuthConstants.ExternalCookieScheme;
                options.ClientId = clientId;
                options.ClientSecret = clientSecret;
                options.CallbackPath = GoogleOAuthConstants.CallbackPath;

                options.Events.OnTicketReceived = async context =>
                {
                    context.HandleResponse();

                    await using var scope = context.HttpContext.RequestServices.CreateAsyncScope();
                    var handler = scope.ServiceProvider.GetRequiredService<GoogleOAuthCallbackHandler>();
                    await handler.HandleAsync(context.HttpContext, context.Principal!);
                };
            });

        return services;
    }

    internal static (string? ClientId, string? ClientSecret) ResolveGoogleCredentials(IConfiguration configuration)
    {
        var section = configuration.GetSection(GoogleAuthOptions.Section);

        var clientId = FirstNonEmpty(
            section["ClientId"],
            configuration["GOOGLE_CLIENT_ID"]);

        var clientSecret = FirstNonEmpty(
            section["ClientSecret"],
            configuration["GOOGLE_CLIENT_SECRET"]);

        return (clientId, clientSecret);
    }

    private static string? FirstNonEmpty(params string?[] values)
    {
        foreach (var value in values)
            if (!string.IsNullOrWhiteSpace(value))
                return value;

        return null;
    }
}