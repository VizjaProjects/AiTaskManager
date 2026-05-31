using Microsoft.EntityFrameworkCore;
using Ordovita.Domain.Surveys.port;
using Ordovita.Domain.Surveys.Questions;
using Ordovita.Infrastructure.Persistence;
using SurveyAggregate = Ordovita.Domain.Surveys.Surveys.Survey;
using SurveyId = Ordovita.Domain.Surveys.Surveys.SurveyId;

namespace Ordovita.Infrastructure.Survey.Persistence.Repository;

public class SurveyRepository(AppDbContext context) : ISurveyRepository
{
    public async Task AddAsync(SurveyAggregate survey, CancellationToken ct = default)
    {
        await context.Surveys.AddAsync(survey, ct);
    }

    public async Task<SurveyAggregate?> GetByIdAsync(SurveyId id, CancellationToken ct = default)
    {
        return await context.Surveys.FirstOrDefaultAsync(s => s.Id == id, ct);
    }

    public async Task<IReadOnlyList<SurveyAggregate>> GetAllAsync(CancellationToken ct = default)
    {
        return await context.Surveys.AsNoTracking().ToListAsync(ct);
    }

    public async Task<IReadOnlyList<SurveyAggregate>> GetActiveAsync(CancellationToken ct = default)
    {
        return await context.Surveys.AsNoTracking().Where(s => s.IsVisible).ToListAsync(ct);
    }

    public async Task DeleteWithDataAsync(SurveyId id, CancellationToken ct = default)
    {
        var questionIds = await context.Questions
            .Where(q => q.SurveyId == id)
            .Select(q => q.Id)
            .ToListAsync(ct);

        if (questionIds.Count > 0)
        {
            await context.UserResponses
                .Where(r => questionIds.Contains(r.QuestionId))
                .ExecuteDeleteAsync(ct);

            await context.Questions
                .Where(q => q.SurveyId == id)
                .ExecuteDeleteAsync(ct);
        }

        await context.Surveys
            .Where(s => s.Id == id)
            .ExecuteDeleteAsync(ct);
    }
}
