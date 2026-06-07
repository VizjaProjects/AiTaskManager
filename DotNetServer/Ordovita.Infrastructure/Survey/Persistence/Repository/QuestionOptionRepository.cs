using Microsoft.EntityFrameworkCore;
using Ordovita.Domain.Surveys.port;
using Ordovita.Domain.Surveys.Questions;
using Ordovita.Infrastructure.Persistence;

namespace Ordovita.Infrastructure.Survey.Persistence.Repository;

public sealed class QuestionOptionRepository(AppDbContext context) : IQuestionOptionRepository
{
    public async Task<IReadOnlyList<QuestionOptionDto>> GetByQuestionIdAsync(
        QuestionId questionId, CancellationToken ct = default)
    {
        try
        {
            var rows = await context.Database
                .SqlQuery<QuestionOptionRow>($"""
                    SELECT id AS Id, option_text AS OptionText
                    FROM surveys_question_options
                    WHERE question_id = {questionId.Value}
                    ORDER BY option_text
                    """)
                .ToListAsync(ct);

            return rows.Select(row => new QuestionOptionDto(row.Id, row.OptionText)).ToList();
        }
        catch
        {
            return [];
        }
    }

    public async Task<IReadOnlySet<QuestionId>> GetQuestionIdsWithOptionsAsync(
        IReadOnlyList<QuestionId> questionIds, CancellationToken ct = default)
    {
        var result = new HashSet<QuestionId>();
        foreach (var questionId in questionIds)
        {
            if ((await GetByQuestionIdAsync(questionId, ct)).Count > 0)
                result.Add(questionId);
        }

        return result;
    }

    public async Task AddRangeAsync(
        QuestionId questionId, IReadOnlyList<string> optionTexts, CancellationToken ct = default)
    {
        if (optionTexts.Count == 0)
            return;

        var now = DateTime.UtcNow;
        foreach (var optionText in optionTexts)
        {
            var optionId = Guid.NewGuid();
            await context.Database.ExecuteSqlAsync($"""
                INSERT INTO surveys_question_options (id, question_id, option_text, createAt, updateAt)
                VALUES ({optionId}, {questionId.Value}, {optionText}, {now}, {now})
                """, ct);
        }
    }

    private sealed record QuestionOptionRow(Guid Id, string OptionText);
}
