using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;

namespace Ordovita.Application.Identity.GoogleOAuth;

public sealed class GoogleOAuthLoginHandler(IExternalAuthService externalAuthService)
    : ICommandHandler<GoogleOAuthLoginCommand, GoogleOAuthLoginResult>
{
    public async Task<Result<GoogleOAuthLoginResult>> Handle(GoogleOAuthLoginCommand command, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(command.Email))
            return Result.Failure<GoogleOAuthLoginResult>(Error.Unauthorized("GoogleOAuthLoginHandler",
                "Google account has no email"));

        var userResult = await externalAuthService.FindOrCreateGoogleUserAsync(
            command.GoogleSubject,
            command.Email,
            command.FullName,
            ct);

        if (userResult.IsFailure)
            return Result.Failure<GoogleOAuthLoginResult>(userResult.Error);

        var user = userResult.Value!;
        return Result.Success(new GoogleOAuthLoginResult(
            user.AspIdentityUserId,
            user.DomainUserId,
            user.Email,
            user.FullName,
            user.Role));
    }
}