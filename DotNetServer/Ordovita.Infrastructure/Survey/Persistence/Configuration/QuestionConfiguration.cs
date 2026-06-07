using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Surveys.Questions;
using Ordovita.Domain.Surveys.Surveys;

namespace Ordovita.Infrastructure.Survey.Persistence.Configuration;

public class QuestionConfiguration : IEntityTypeConfiguration<Question>
{
    public void Configure(EntityTypeBuilder<Question> builder)
    {
        builder.ToTable("Survey.Questions");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasConversion(q => q.Value, value => QuestionId.From(value)).ValueGeneratedNever();

        builder.Property(q => q.SurveyId).HasConversion(q => q.Value, value => SurveyId.From(value));

        builder.Property(q => q.QuestionText).HasMaxLength(250).IsRequired();

        builder.Property(q => q.IsRequired).IsRequired();
        builder.Property(q => q.Hint).HasMaxLength(250);
        builder.Property(q => q.CreatedAt).IsRequired();
        builder.Property(q => q.UpdatedAt).IsRequired();

        builder.HasIndex(q => q.SurveyId);
    }
}