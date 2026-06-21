using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Identity;
using Ordovita.Domain.LlmStatistic;

namespace Ordovita.Infrastructure.LlmStatistic.Persistence;

public class LlmStatisticConfiguration : IEntityTypeConfiguration<Domain.LlmStatistic.LlmStatistic>
{
    public void Configure(EntityTypeBuilder<Domain.LlmStatistic.LlmStatistic> builder)
    {
        builder.ToTable("LlmStatistic.LlmStatistics");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .HasConversion(p => p.Value, value => LlmStatisticId.From(value))
            .ValueGeneratedNever();

        builder.Property(p => p.Prompt)
            .IsRequired();

        builder.Property(p => p.OutputTokenCount)
            .IsRequired();

        builder.Property(p => p.InputTokenCount)
            .IsRequired();

        builder.Property(p => p.TotalTokenCount)
            .IsRequired();

        builder.Property(p => p.RequestedAt)
            .IsRequired();

        builder.Property(p => p.RequestedBy)
            .HasConversion(p => p.Value, value => UserId.From(value))
            .IsRequired();

        builder.Property(p => p.RequestType)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(p => p.RequestedBy);
        builder.HasIndex(p => p.RequestedAt);
        builder.HasIndex(p => p.RequestType);
    }
}