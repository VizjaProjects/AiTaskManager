using Ordovita.Domain.Identity;
using Ordovita.Domain.Surveys.Surveys;

namespace Ordovita.Application.Surveys.GetUserAnswers;

public interface IUserAnswerReader
{
    Task<IReadOnlyList<SurveyWithAnswersDto>> GetByUserIdAsync(UserId userId, CancellationToken ct = default);

    Task<IReadOnlyList<SurveyWithAnswersDto>> GetBySurveyIdAsync(
        SurveyId surveyId, CancellationToken ct = default);
}