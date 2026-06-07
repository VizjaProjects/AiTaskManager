using Microsoft.EntityFrameworkCore;
using Ordovita.Infrastructure.Persistence;

namespace Ordovita.Infrastructure.Survey;

public static class SurveyDataSeeder
{
    public static async Task EnsureQuestionOptionsTableAsync(AppDbContext db, CancellationToken ct = default)
    {
        await db.Database.ExecuteSqlAsync($"""
                                           CREATE TABLE IF NOT EXISTS surveys_question_options (
                                               id CHAR(36) NOT NULL,
                                               question_id CHAR(36) NOT NULL,
                                               option_text VARCHAR(100) NOT NULL,
                                               createAt DATETIME(6) NOT NULL,
                                               updateAt DATETIME(6) NOT NULL,
                                               PRIMARY KEY (id),
                                               INDEX IX_surveys_question_options_question_id (question_id)
                                           )
                                           """, ct);
    }

    /// <summary>
    /// Publishes legacy surveys that have questions but were left as drafts after Java → .NET migration.
    /// </summary>
    public static async Task PublishLegacySurveysAsync(AppDbContext db, CancellationToken ct = default)
    {
        await db.Database.ExecuteSqlAsync($"""
                                           UPDATE `Survey.Surveys` s
                                           SET s.IsVisible = 1
                                           WHERE s.IsVisible = 0
                                             AND EXISTS (
                                               SELECT 1 FROM `Survey.Questions` q WHERE q.SurveyId = s.Id
                                             )
                                           """, ct);
    }
}