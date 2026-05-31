using Microsoft.EntityFrameworkCore;
using Ordovita.Domain.Surveys.port;
using Ordovita.Domain.Surveys.Questions;
using Ordovita.Domain.Surveys.Surveys;
using Ordovita.Infrastructure.Persistence;

namespace Ordovita.Infrastructure.Survey.Persistence.Repository;

public class QuestionRepository(AppDbContext context) : IQuestionRepository
{
    public async Task AddAsync(Question question, CancellationToken ct = default)
    {
        await context.Questions.AddAsync(question, ct);
    }

    public async Task<Question?> GetByIdAsync(QuestionId questionId, CancellationToken ct = default)
    {
        return await context.Questions.FirstOrDefaultAsync(q => q.Id == questionId, ct);
    }

    public async Task<IReadOnlyList<Question>> GetAllBySurveyIdAsync(SurveyId surveyId, CancellationToken ct = default)
    {
        return await context.Questions
            .AsNoTracking()
            .Where(q => q.SurveyId == surveyId)
            .ToListAsync(ct);
    }

    public void Delete(Question question)
    {
        context.Questions.Remove(question);
    }
}
