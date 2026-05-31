using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Surveys.Surveys;

namespace Ordovita.Infrastructure.Survey.Persistence;

public class SurveyConfiguration : IEntityTypeConfiguration<Domain.Surveys.Surveys.Survey>
{
    public void Configure(EntityTypeBuilder<Domain.Surveys.Surveys.Survey> builder)
    {
        builder.ToTable("Survey.Surveys");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasConversion(id => id.Value, value => SurveyId.From(value));

        builder.Property(s => s.Title).HasMaxLength(25).IsRequired();
        builder.Property(s => s.Description).HasMaxLength(50).IsRequired();
        builder.Property(s => s.CreatedAt).IsRequired();
        builder.Property(s => s.UpdatedAt).IsRequired();
        builder.Property(s => s.IsVisible).IsRequired();
    }
}