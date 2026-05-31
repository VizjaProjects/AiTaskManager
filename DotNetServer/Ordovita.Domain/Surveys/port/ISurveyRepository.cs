using Ordovita.Domain.Surveys.Surveys;

namespace Ordovita.Domain.Surveys.port;

public interface ISurveyRepository
{
    Task AddAsync(Survey survey, CancellationToken ct = default);
    Task<Survey?> GetByIdAsync(SurveyId id, CancellationToken ct = default);
    Task<IReadOnlyList<Survey>> GetAllAsync(CancellationToken ct = default);
    Task<IReadOnlyList<Survey>> GetActiveAsync(CancellationToken ct = default);
    Task DeleteWithDataAsync(SurveyId id, CancellationToken ct = default);
}
