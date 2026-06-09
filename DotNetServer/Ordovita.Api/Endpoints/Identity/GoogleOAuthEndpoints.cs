using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Identity.GoogleOAuth;
using Ordovita.Infrastructure.Identity;

namespace Ordovita.Api.Endpoints.Identity;

public static class GoogleOAuthConstants
{
    public const string ExternalCookieScheme = "Ordovita.External";
    public const string DesktopClientCookie = "oauth2_client";
    public const string DesktopClientValue = "desktop";
    public const string CallbackPath = "/login/oauth2/code/google";
}

public sealed class GoogleOAuthCallbackHandler(
    ISender sender,
    IdentityTokenIssuer tokenIssuer,
    UserManager<AspIdentityUser> userManager,
    DesktopOAuthCodeService desktopOAuthCodeService,
    IOptions<OAuth2Options> oauth2Options,
    ILogger<GoogleOAuthCallbackHandler> logger)
{
    public async Task HandleAsync(HttpContext context, ClaimsPrincipal principal)
    {
        var isDesktopClient = IsDesktopClient(context);

        var email = principal.FindFirstValue(ClaimTypes.Email)
                    ?? principal.FindFirstValue("email");
        var fullName = principal.FindFirstValue(ClaimTypes.Name)
                       ?? principal.FindFirstValue("name");
        var subject = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? principal.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(email))
        {
            logger.LogError("Google OAuth failed: email not provided");
            await RedirectWithErrorAsync(context, isDesktopClient, "oauth_no_email");
            return;
        }

        if (string.IsNullOrWhiteSpace(fullName))
            fullName = email.Split('@')[0];

        if (string.IsNullOrWhiteSpace(subject))
        {
            logger.LogError("Google OAuth failed: subject not provided");
            await RedirectWithErrorAsync(context, isDesktopClient, "oauth_failed");
            return;
        }

        try
        {
            var loginResult = await sender.Send(
                new GoogleOAuthLoginCommand(subject, email, fullName),
                context.RequestAborted);

            if (loginResult.IsFailure)
            {
                logger.LogError("Google OAuth login failed: {Error}", loginResult.Error.Description);
                await RedirectWithErrorAsync(context, isDesktopClient, "oauth_failed");
                return;
            }

            var oauthUser = loginResult.Value!;
            var aspUser = await userManager.FindByIdAsync(oauthUser.AspIdentityUserId);
            if (aspUser is null)
            {
                logger.LogError("Google OAuth failed: ASP user not found after login");
                await RedirectWithErrorAsync(context, isDesktopClient, "oauth_failed");
                return;
            }

            var tokens = await tokenIssuer.IssueAsync(aspUser, oauthUser.Role, context.RequestAborted);
            var userInfo = new LoginUserInfo(
                oauthUser.UserId,
                oauthUser.Email,
                oauthUser.FullName,
                oauthUser.Role);

            ClearDesktopClientCookie(context);

            if (isDesktopClient)
            {
                var code = desktopOAuthCodeService.Create(tokens, userInfo);
                var redirectUrl = BuildRedirectUrl(
                    oauth2Options.Value.DesktopBrowserCallbackUrl,
                    "code",
                    code);
                context.Response.Redirect(redirectUrl);
                return;
            }

            var webRedirect = oauth2Options.Value.FrontendUrl.TrimEnd('/')
                              + "/oauth-callback"
                              + "?token=" + UrlEncoder.Default.Encode(tokens.AccessToken)
                              + "&refreshToken=" + UrlEncoder.Default.Encode(tokens.RefreshToken)
                              + "&userId=" + oauthUser.UserId
                              + "&email=" + UrlEncoder.Default.Encode(oauthUser.Email)
                              + "&fullName=" + UrlEncoder.Default.Encode(oauthUser.FullName)
                              + "&role=" + UrlEncoder.Default.Encode(oauthUser.Role);

            context.Response.Redirect(webRedirect);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Google OAuth processing failed");
            await RedirectWithErrorAsync(context, isDesktopClient, "oauth_failed");
        }
    }

    private static bool IsDesktopClient(HttpContext context) =>
        context.Request.Cookies.TryGetValue(GoogleOAuthConstants.DesktopClientCookie, out var value)
        && string.Equals(value, GoogleOAuthConstants.DesktopClientValue, StringComparison.OrdinalIgnoreCase);

    private static void ClearDesktopClientCookie(HttpContext context) =>
        context.Response.Cookies.Delete(GoogleOAuthConstants.DesktopClientCookie);

    private async Task RedirectWithErrorAsync(HttpContext context, bool isDesktopClient, string error)
    {
        ClearDesktopClientCookie(context);

        if (isDesktopClient)
        {
            var redirectUrl = BuildRedirectUrl(
                oauth2Options.Value.DesktopBrowserCallbackUrl,
                "error",
                error);
            context.Response.Redirect(redirectUrl);
            return;
        }

        var loginUrl = BuildRedirectUrl(
            oauth2Options.Value.FrontendUrl.TrimEnd('/') + "/login",
            "error",
            error);
        context.Response.Redirect(loginUrl);
        await Task.CompletedTask;
    }

    private static string BuildRedirectUrl(string baseUrl, string parameterName, string parameterValue)
    {
        var separator = baseUrl.Contains('?', StringComparison.Ordinal) ? "&" : "?";
        return baseUrl + separator + parameterName + "=" + UrlEncoder.Default.Encode(parameterValue);
    }
}

public static class GoogleOAuthEndpointExtensions
{
    public static IEndpointRouteBuilder MapGoogleOAuthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/oauth2/authorization/google", (HttpContext context) =>
            {
                if (string.Equals(context.Request.Query["client"], "desktop", StringComparison.OrdinalIgnoreCase))
                {
                    context.Response.Cookies.Append(
                        GoogleOAuthConstants.DesktopClientCookie,
                        GoogleOAuthConstants.DesktopClientValue,
                        new CookieOptions
                        {
                            HttpOnly = true,
                            MaxAge = TimeSpan.FromMinutes(3),
                            Path = "/",
                            SameSite = SameSiteMode.Lax,
                            Secure = context.Request.IsHttps
                        });
                }

                var properties = new AuthenticationProperties { RedirectUri = GoogleOAuthConstants.CallbackPath };
                return Results.Challenge(properties, [GoogleDefaults.AuthenticationScheme]);
            })
            .AllowAnonymous()
            .ExcludeFromDescription();

        return app;
    }

    public static RouteGroupBuilder MapGoogleOAuthIdentityEndpoints(this RouteGroupBuilder identityGroup)
    {
        identityGroup.MapPost("/oauth2/desktop/exchange",
                Task<Results<Ok<LoginResponse>, ProblemHttpResult>> (
                    [FromBody] DesktopOAuthExchangeRequest request,
                    [FromServices] DesktopOAuthCodeService desktopOAuthCodeService) =>
                {
                    try
                    {
                        var payload = desktopOAuthCodeService.Consume(request.Code);
                        return Task.FromResult<Results<Ok<LoginResponse>, ProblemHttpResult>>(TypedResults.Ok(new LoginResponse(
                            payload.TokenPair.AccessToken,
                            payload.TokenPair.RefreshToken,
                            payload.UserInfo.UserId,
                            payload.UserInfo.Email,
                            payload.UserInfo.FullName,
                            payload.UserInfo.Role)));
                    }
                    catch (InvalidOperationException ex)
                    {
                        return Task.FromResult<Results<Ok<LoginResponse>, ProblemHttpResult>>(
                            TypedResults.Problem(ex.Message, statusCode: StatusCodes.Status401Unauthorized));
                    }
                })
            .AllowAnonymous()
            .Produces<LoginResponse>(200);

        return identityGroup;
    }
}

public sealed record DesktopOAuthExchangeRequest(string Code);
