using Microsoft.EntityFrameworkCore;
using Ordovita.Application.Surveys.GetUserAnswers;
using Ordovita.Domain.Identity;
using Ordovita.Infrastructure.Persistence;

namespace Ordovita.Infrastructure.Survey;

public class UserAnswerReader(AppDbContext context) : IUserAnswerReader
{
    public async Task<IReadOnlyList<SurveyWithAnswersDto>> GetByUserIdAsync(UserId userId,
        CancellationToken ct = default)
    {
        return await (
            from r in context.UserResponses
            join q in context.Questions on r.QuestionId equals q.Id
            join s in context.Surveys on q.SurveyId equals s.Id
            where r.UserId == userId
            orderby s.Description descending
            select new SurveyWithAnswersDto(
                s.Id.Value,
                s.Description,
                q.Id.Value,
                q.QuestionText,
                r.Id.Value,
                r.TextAnswer.Value)
        ).ToListAsync(ct);
    }
}