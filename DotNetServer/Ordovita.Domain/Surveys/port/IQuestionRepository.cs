using Ordovita.Domain.Surveys.Questions;
using Ordovita.Domain.Surveys.Surveys;

namespace Ordovita.Domain.Surveys.port;

public interface IQuestionRepository
{
    Task AddAsync(Question question, CancellationToken ct = default);
    Task<Question?> GetByIdAsync(QuestionId questionId, CancellationToken ct = default);
    Task<IReadOnlyList<Question>> GetAllBySurveyIdAsync(SurveyId surveyId, CancellationToken ct = default);
    void Delete(Question question);
}
