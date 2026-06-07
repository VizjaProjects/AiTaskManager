using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Surveys.Questions;
using Ordovita.Domain.Surveys.UserResponse;

namespace Ordovita.Infrastructure.Survey.Persistence.Configuration;

public class UserResponseConfiguration : IEntityTypeConfiguration<UserResponse>
{
    public void Configure(EntityTypeBuilder<UserResponse> builder)
    {
        builder.ToTable("Survey.UserResponses");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasConversion(s => s.Value, value => UserResponseId.From(value))
            .ValueGeneratedNever();

        builder.Property(s => s.UserId).HasConversion(s => s.Value, value => UserId.From(value)).IsRequired();
        builder.Property(s => s.QuestionId).HasConversion(s => s.Value, value => QuestionId.From(value)).IsRequired();

        builder.Property(s => s.TextAnswer).HasConversion(s => s.Value, value => TextAnswer.From(value))
            .HasMaxLength(500).IsRequired();
        builder.Property(s => s.CreatedAt).IsRequired();
        builder.Property(s => s.UpdatedAt).IsRequired();


        builder.HasIndex(s => new { s.UserId, s.QuestionId }).IsUnique();
    }
}