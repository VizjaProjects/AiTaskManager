using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Identity;
using Ordovita.Domain.LlmSettings;

namespace Ordovita.Infrastructure.LlmSettings.Persistance;

public class LlmSettingsConfiguration : IEntityTypeConfiguration<Domain.LlmSettings.LlmSettings>
{
    public void Configure(EntityTypeBuilder<Domain.LlmSettings.LlmSettings> builder)
    {
        builder.ToTable("LlmSettings.LlmSettings");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasConversion(p => p.Value, value => LlmSettingsId.From(value))
            .ValueGeneratedNever();

        builder.Property(p => p.UserId).HasConversion(p => p.Value, value => UserId.From(value)).IsRequired();
        builder.Property(p => p.ApiKey).IsRequired();
        builder.Property(p => p.Model).HasMaxLength(120).IsRequired();
        builder.Property(p => p.Provider).HasMaxLength(120).IsRequired();

        builder.HasIndex(p => p.UserId);
    }
}