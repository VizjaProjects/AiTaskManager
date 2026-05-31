using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;

namespace Ordovita.Application.Surveys.GetUserAnswers;

public sealed class GetUserAnswersHandler(
    IUserContext userContext,
    IUserRepository userRepository,
    IUserAnswerReader reader) : IQueryHandler<GetUserAnswersQuery, IReadOnlyList<SurveyWithAnswersDto>>
{
    public async Task<Result<IReadOnlyList<SurveyWithAnswersDto>>> Handle(GetUserAnswersQuery query,
        CancellationToken ct)
    {
        var userResult = await SurveyUserResolver.GetCurrentDomainUserAsync(userContext, userRepository, ct);
        if (userResult.IsFailure)
            return Result.Failure<IReadOnlyList<SurveyWithAnswersDto>>(userResult.Error);

        var answers = await reader.GetByUserIdAsync(userResult.Value!.Id, ct);
        return Result.Success(answers);
    }
}