using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Security.Claims;
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
using Ordovita.Application.Identity.ConfirmUserEmail;
using Ordovita.Application.Identity.RegisterUser;
using Ordovita.Domain.Identity;
using Ordovita.Infrastructure.Identity;

namespace Ordovita.Api.Endpoints.Identity;

public static class AspIdentityEndpoint
{
    private static readonly EmailAddressAttribute _emailAddressAttribute = new();

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
                {
                    if (!await userManager.IsInRoleAsync(user, Role.USER.ToString()))
                        await userManager.AddToRoleAsync(user, Role.USER.ToString());

                    await SendConfirmationEmailAsync(user, userManager, context, request.Email, linkGenerator,
                        emailSender);
                }

                return Results.Created(string.Empty, new RegisterResponse(result.Value));
            })
            .WithName("RegisterUser")
            .WithSummary("Register user")
            .Produces<RegisterResponse>(201);

        routeGroup.MapPost("/login", async Task<Results<Ok<LoginResponse>, ProblemHttpResult>>
            ([FromBody] LoginRequest login,
                [FromServices] SignInManager<AspIdentityUser> signInManager,
                [FromServices] UserManager<AspIdentityUser> userManager,
                [FromServices] IUserRepository repository,
                [FromServices] IdentityTokenIssuer tokenIssuer,
                CancellationToken ct) =>
            {
                signInManager.AuthenticationScheme = IdentityConstants.BearerScheme;

                var aspUser = await userManager.FindByEmailAsync(login.Email);
                if (aspUser == null)
                    return TypedResults.Problem("Asp user not found", statusCode: StatusCodes.Status404NotFound);

                var domainUser = await repository.GetAsyncByAspId(aspUser.Id);
                if (domainUser == null)
                    return TypedResults.Problem("Domain user not found", statusCode: StatusCodes.Status404NotFound);

                if (!aspUser.EmailConfirmed && !domainUser.IsEmailVerified && !domainUser.IsEnable)
                    return TypedResults.Problem("User is not active!", statusCode: StatusCodes.Status406NotAcceptable);

                if (!await userManager.HasPasswordAsync(aspUser))
                    return TypedResults.Problem(
                        title: "Identity.PasswordNotSet",
                        detail: "This account does not have a password yet.",
                        statusCode: StatusCodes.Status409Conflict);

                var result = await signInManager.CheckPasswordSignInAsync(aspUser, login.Password, true);

                if (result.RequiresTwoFactor)
                {
                    if (!string.IsNullOrEmpty(login.TwoFactorCode))
                        result = await signInManager.TwoFactorAuthenticatorSignInAsync(login.TwoFactorCode, false,
                            false);
                    else if (!string.IsNullOrEmpty(login.TwoFactorRecoveryCode))
                        result = await signInManager.TwoFactorRecoveryCodeSignInAsync(login.TwoFactorRecoveryCode);
                }

                if (!result.Succeeded)
                    return TypedResults.Problem(result.ToString(), statusCode: StatusCodes.Status401Unauthorized);

                var tokens = await tokenIssuer.IssueAsync(aspUser, domainUser.Role.ToString(), ct);
                var userInfo = IdentityTokenIssuer.ToUserInfo(domainUser);

                return TypedResults.Ok(new LoginResponse(
                    tokens.AccessToken,
                    tokens.RefreshToken,
                    userInfo.UserId,
                    userInfo.Email,
                    userInfo.FullName,
                    userInfo.Role));
            })
            .Produces<LoginResponse>(200);

        routeGroup.MapPost("/refresh",
                async Task<Results<Ok<RefreshTokenResponse>, UnauthorizedHttpResult>>
                ([FromBody] RefreshRequest refreshRequest,
                    [FromServices] SignInManager<AspIdentityUser> signInManager,
                    [FromServices] IUserRepository userRepository,
                    [FromServices] IdentityTokenIssuer tokenIssuer,
                    CancellationToken ct) =>
                {
                    var refreshTokenProtector =
                        bearerTokenOptions.Get(IdentityConstants.BearerScheme).RefreshTokenProtector;
                    var refreshTicket = refreshTokenProtector.Unprotect(refreshRequest.RefreshToken);

                    if (refreshTicket?.Properties?.ExpiresUtc is not { } expiresUtc ||
                        timeProvider.GetUtcNow() >= expiresUtc ||
                        await signInManager.ValidateSecurityStampAsync(refreshTicket.Principal) is not AspIdentityUser
                            user)
                        return TypedResults.Unauthorized();

                    var domainUser = await userRepository.GetAsyncByAspId(user.Id);
                    var tokens = await tokenIssuer.IssueAsync(
                        user, domainUser?.Role.ToString(), ct);
                    return TypedResults.Ok(new RefreshTokenResponse(tokens.AccessToken, tokens.RefreshToken));
                })
            .Produces<RefreshTokenResponse>(200);

        routeGroup.MapGet("/confirmEmail", async Task<Results<ContentHttpResult, UnauthorizedHttpResult>>
            ([FromQuery] string userId, [FromQuery] string code, [FromQuery] string? changedEmail,
                [FromServices] UserManager<AspIdentityUser> userManager, [FromServices] ISender sender) =>
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
                {
                    result = await userManager.ConfirmEmailAsync(user, code);
                }
                else
                {
                    result = await userManager.ChangeEmailAsync(user, changedEmail, code);
                    if (result.Succeeded)
                        result = await userManager.SetUserNameAsync(user, changedEmail);
                }

                var confirmEmailResult = await sender.Send(new ConfirmUserEmailCommand(userId));

                if (!result.Succeeded || confirmEmailResult.IsFailure)
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

            await SendConfirmationEmailAsync(user, userManager, context, resendRequest.Email, linkGenerator,
                emailSender);
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


        routeGroup.MapPost("/restartPassword", async Task<Results<Ok<InfoResponse>, ValidationProblem, NotFound>>
        (ClaimsPrincipal claimsPrincipal, [FromBody] InfoRequest infoRequest, HttpContext context,
            [FromServices] IServiceProvider sp, [FromServices] IEmailSender<AspIdentityUser> emailSender) =>
        {
            var userManager = sp.GetRequiredService<UserManager<AspIdentityUser>>();
            if (await userManager.GetUserAsync(claimsPrincipal) is not { } user) return TypedResults.NotFound();

            if (!string.IsNullOrEmpty(infoRequest.NewEmail))
                return CreateValidationProblem(
                    IdentityResult.Failed(userManager.ErrorDescriber.InvalidEmail(infoRequest.NewEmail)));

            if (!string.IsNullOrEmpty(infoRequest.NewPassword))
            {
                if (string.IsNullOrEmpty(infoRequest.OldPassword))
                    return CreateValidationProblem("OldPasswordRequired",
                        "The old password is required to set a new password. If the old password is forgotten, use /resetPassword.");

                var changePasswordResult =
                    await userManager.ChangePasswordAsync(user, infoRequest.OldPassword, infoRequest.NewPassword);
                if (!changePasswordResult.Succeeded) return CreateValidationProblem(changePasswordResult);
            }


            return TypedResults.Ok(await CreateInfoResponseAsync(user, userManager));
        });

        routeGroup.MapGoogleOAuthIdentityEndpoints();

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

    private static async Task<InfoResponse> CreateInfoResponseAsync<TUser>(TUser user, UserManager<TUser> userManager)
        where TUser : class
    {
        return new InfoResponse
        {
            Email = await userManager.GetEmailAsync(user) ??
                    throw new NotSupportedException("Users must have an email."),
            IsEmailConfirmed = await userManager.IsEmailConfirmedAsync(user)
        };
    }

    private static ValidationProblem CreateValidationProblem(string errorCode, string errorDescription)
    {
        return TypedResults.ValidationProblem(new Dictionary<string, string[]>
        {
            { errorCode, [errorDescription] }
        });
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
