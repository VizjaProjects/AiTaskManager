using System.Diagnostics;
using System.Text;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using Ordovita.Api.Common;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Identity.RegisterUser;
using Ordovita.Infrastructure.Identity;

namespace Ordovita.Api.Endpoints.Identity;

public static class AspIdentityEndpoint
{
    public static RouteGroupBuilder MapAspIdentityApi(this IEndpointRouteBuilder endpoints)
    {
        ArgumentNullException.ThrowIfNull(endpoints);

        var timeProvider = endpoints.ServiceProvider.GetRequiredService<TimeProvider>();
        var bearerTokenOptions = endpoints.ServiceProvider.GetRequiredService<IOptionsMonitor<BearerTokenOptions>>();

        string? confirmEmailEndpointName = null;

        var routeGroup = endpoints.MapGroup("/identity").WithTags("AspIdentity");

        routeGroup.MapPost("/register", async Task<IResult> (
            [FromBody] CreateUserRequest request,
            HttpContext context,
            [FromServices] ISender sender,
            [FromServices] UserManager<AspIdentityUser> userManager,
            [FromServices] LinkGenerator linkGenerator,
            [FromServices] IEmailSender<AspIdentityUser> emailSender,
            CancellationToken ct) =>
        {
            var result = await sender.Send(
                new RegisterUserCommand(request.FullName, request.Email, request.Password), ct);

            if (!result.IsSuccess)
                return result.Error.ToProblem();

            if (await userManager.FindByEmailAsync(request.Email) is { } user)
                await SendConfirmationEmailAsync(user, userManager, context, request.Email, linkGenerator, emailSender);

            return Results.Created(string.Empty, result.Value);
        })
            .WithName("RegisterUser")
            .WithSummary("Register user")
            .Produces<Guid>();

        routeGroup.MapPost("/login", async Task<Results<Ok<AccessTokenResponse>, EmptyHttpResult, ProblemHttpResult>>
        ([FromBody] LoginRequest login, [FromQuery] bool? useCookies, [FromQuery] bool? useSessionCookies,
            [FromServices] SignInManager<AspIdentityUser> signInManager) =>
        {
            var useCookieScheme = useCookies == true || useSessionCookies == true;
            var isPersistent = useCookies == true && useSessionCookies != true;
            signInManager.AuthenticationScheme =
                useCookieScheme ? IdentityConstants.ApplicationScheme : IdentityConstants.BearerScheme;

            var result = await signInManager.PasswordSignInAsync(login.Email, login.Password, isPersistent, true);

            if (result.RequiresTwoFactor)
            {
                if (!string.IsNullOrEmpty(login.TwoFactorCode))
                    result = await signInManager.TwoFactorAuthenticatorSignInAsync(login.TwoFactorCode, isPersistent,
                        isPersistent);
                else if (!string.IsNullOrEmpty(login.TwoFactorRecoveryCode))
                    result = await signInManager.TwoFactorRecoveryCodeSignInAsync(login.TwoFactorRecoveryCode);
            }

            if (!result.Succeeded)
                return TypedResults.Problem(result.ToString(), statusCode: StatusCodes.Status401Unauthorized);

            return TypedResults.Empty;
        });

        routeGroup.MapPost("/refresh",
            async Task<Results<Ok<AccessTokenResponse>, UnauthorizedHttpResult, SignInHttpResult, ChallengeHttpResult>>
                ([FromBody] RefreshRequest refreshRequest, [FromServices] SignInManager<AspIdentityUser> signInManager) =>
            {
                var refreshTokenProtector =
                    bearerTokenOptions.Get(IdentityConstants.BearerScheme).RefreshTokenProtector;
                var refreshTicket = refreshTokenProtector.Unprotect(refreshRequest.RefreshToken);

                if (refreshTicket?.Properties?.ExpiresUtc is not { } expiresUtc ||
                    timeProvider.GetUtcNow() >= expiresUtc ||
                    await signInManager.ValidateSecurityStampAsync(refreshTicket.Principal) is not AspIdentityUser user)
                    return TypedResults.Challenge();

                var newPrincipal = await signInManager.CreateUserPrincipalAsync(user);
                return TypedResults.SignIn(newPrincipal, authenticationScheme: IdentityConstants.BearerScheme);
            });

        routeGroup.MapGet("/confirmEmail", async Task<Results<ContentHttpResult, UnauthorizedHttpResult>>
            ([FromQuery] string userId, [FromQuery] string code, [FromQuery] string? changedEmail,
                [FromServices] UserManager<AspIdentityUser> userManager) =>
            {
                if (await userManager.FindByIdAsync(userId) is not { } user)
                    return TypedResults.Unauthorized();

                try
                {
                    code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(code));
                }
                catch (FormatException)
                {
                    return TypedResults.Unauthorized();
                }

                IdentityResult result;

                if (string.IsNullOrEmpty(changedEmail))
                    result = await userManager.ConfirmEmailAsync(user, code);
                else
                {
                    result = await userManager.ChangeEmailAsync(user, changedEmail, code);
                    if (result.Succeeded)
                        result = await userManager.SetUserNameAsync(user, changedEmail);
                }

                if (!result.Succeeded)
                    return TypedResults.Unauthorized();

                
                return TypedResults.Text("Thank you for confirming your email.");
            })
            .Add(endpointBuilder =>
            {
                var finalPattern = ((RouteEndpointBuilder)endpointBuilder).RoutePattern.RawText;
                confirmEmailEndpointName = $"{nameof(MapAspIdentityApi)}-{finalPattern}";
                endpointBuilder.Metadata.Add(new EndpointNameMetadata(confirmEmailEndpointName));
            });

        routeGroup.MapPost("/resendConfirmationEmail", async Task<Ok> (
            [FromBody] ResendConfirmationEmailRequest resendRequest,
            HttpContext context,
            [FromServices] UserManager<AspIdentityUser> userManager,
            [FromServices] LinkGenerator linkGenerator,
            [FromServices] IEmailSender<AspIdentityUser> emailSender) =>
        {
            if (await userManager.FindByEmailAsync(resendRequest.Email) is not { } user)
                return TypedResults.Ok();

            await SendConfirmationEmailAsync(user, userManager, context, resendRequest.Email, linkGenerator, emailSender);
            return TypedResults.Ok();
        });

        routeGroup.MapPost("/forgotPassword", async Task<Results<Ok, ValidationProblem>> (
            [FromBody] ForgotPasswordRequest resetRequest,
            [FromServices] UserManager<AspIdentityUser> userManager,
            [FromServices] IEmailSender<AspIdentityUser> emailSender) =>
        {
            var user = await userManager.FindByEmailAsync(resetRequest.Email);

            if (user is not null && await userManager.IsEmailConfirmedAsync(user))
            {
                var code = await userManager.GeneratePasswordResetTokenAsync(user);
                code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));

                await emailSender.SendPasswordResetCodeAsync(user, resetRequest.Email,
                    HtmlEncoder.Default.Encode(code));
            }

            return TypedResults.Ok();
        });

        routeGroup.MapPost("/resetPassword", async Task<Results<Ok, ValidationProblem>> (
            [FromBody] ResetPasswordRequest resetRequest,
            [FromServices] UserManager<AspIdentityUser> userManager) =>
        {
            var user = await userManager.FindByEmailAsync(resetRequest.Email);

            if (user is null || !await userManager.IsEmailConfirmedAsync(user))
                return CreateValidationProblem(IdentityResult.Failed(userManager.ErrorDescriber.InvalidToken()));

            IdentityResult result;
            try
            {
                var code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(resetRequest.ResetCode));
                result = await userManager.ResetPasswordAsync(user, code, resetRequest.NewPassword);
            }
            catch (FormatException)
            {
                result = IdentityResult.Failed(userManager.ErrorDescriber.InvalidToken());
            }

            if (!result.Succeeded)
                return CreateValidationProblem(result);

            return TypedResults.Ok();
        });
        

        return routeGroup;
        
        async Task SendConfirmationEmailAsync(
            AspIdentityUser user,
            UserManager<AspIdentityUser> userManager,
            HttpContext context,
            string email,
            LinkGenerator linkGenerator,
            IEmailSender<AspIdentityUser> emailSender,
            bool isChange = false)
        {
        
            if (confirmEmailEndpointName is null)
                throw new NotSupportedException("No email confirmation endpoint was registered!");


            var code = isChange
                ? await userManager.GenerateChangeEmailTokenAsync(user, email)
                : await userManager.GenerateEmailConfirmationTokenAsync(user);
            code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));

            var userId = await userManager.GetUserIdAsync(user);
            var routeValues = new RouteValueDictionary
            {
                ["userId"] = userId,
                ["code"] = code
            };

            if (isChange)
                routeValues.Add("changedEmail", email);

            var confirmEmailUrl = linkGenerator.GetUriByName(context, confirmEmailEndpointName, routeValues)
                                  ?? throw new NotSupportedException(
                                      $"Could not find endpoint named '{confirmEmailEndpointName}'.");
        
        

            await emailSender.SendConfirmationLinkAsync(user, email, confirmEmailUrl);
        }
    }



    private static ValidationProblem CreateValidationProblem(IdentityResult result)
    {
        Debug.Assert(!result.Succeeded);
        var errorDictionary = new Dictionary<string, string[]>(1);

        foreach (var error in result.Errors)
        {
            string[] newDescriptions;

            if (errorDictionary.TryGetValue(error.Code, out var descriptions))
            {
                newDescriptions = new string[descriptions.Length + 1];
                Array.Copy(descriptions, newDescriptions, descriptions.Length);
                newDescriptions[descriptions.Length] = error.Description;
            }
            else
            {
                newDescriptions = [error.Description];
            }

            errorDictionary[error.Code] = newDescriptions;
        }

        return TypedResults.ValidationProblem(errorDictionary);
    }
}

public sealed record CreateUserRequest(
    string FullName,
    string Email,
    string Password);
