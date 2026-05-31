using Ordovita.Application.Abstraction.Identity;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using DomainUserEntity = Ordovita.Domain.Identity.DomainUser;

namespace Ordovita.Application.Surveys;

internal static class SurveyUserResolver
{
    public static async Task<Result<DomainUserEntity>> GetCurrentDomainUserAsync(
        IUserContext userContext,
        IUserRepository userRepository,
        CancellationToken ct)
    {
        if (userContext.UserId is not { } aspUserId)
            return Result.Failure<DomainUserEntity>(Error.Unauthorized("Survey.User", "User is not authenticated."));

        var user = await userRepository.GetAsyncByAspId(aspUserId.ToString(), ct);
        if (user is null)
            return Result.Failure<DomainUserEntity>(Error.NotFound("Survey.User", "User was not found."));

        return Result.Success(user);
    }
}
