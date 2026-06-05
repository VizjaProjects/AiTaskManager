using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Tasks;

namespace Ordovita.Infrastructure.Tasks.Persistence.Configuration;

public sealed class CalendarEventConfiguration : IEntityTypeConfiguration<CalendarEvent>
{
    public void Configure(EntityTypeBuilder<CalendarEvent> builder)
    {
        builder.ToTable("Tasks.Events");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasConversion(id => id.Value, value => EventId.From(value));

        builder.Property(e => e.TaskId)
            .HasConversion(
                id => id.HasValue ? id.Value.Value : (Guid?)null,
                value => value.HasValue ? TaskId.From(value.Value) : null);

        builder.Property(e => e.Title).HasMaxLength(200).IsRequired();
        builder.Property(e => e.StartDateTime).IsRequired();
        builder.Property(e => e.EndDateTime).IsRequired();
        builder.Property(e => e.AllDay).IsRequired();
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(e => e.ProposedBy).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(e => e.CalendarId)
            .HasConversion(id => id.Value, value => CalendarId.From(value))
            .IsRequired();
        builder.Property(e => e.CreatedAt).IsRequired();
        builder.Property(e => e.UpdatedAt).IsRequired();

        builder.HasIndex(e => e.CalendarId);
        builder.HasIndex(e => e.TaskId);
    }
}
