using Ordovita.Domain.Identity;

namespace Ordovita.Application.Surveys.GetUserAnswers;

public interface IUserAnswerReader
{
    Task<IReadOnlyList<SurveyWithAnswersDto>> GetByUserIdAsync(UserId userId, CancellationToken ct = default);
}