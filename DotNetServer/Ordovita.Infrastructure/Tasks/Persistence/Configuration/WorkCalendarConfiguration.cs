using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Workspace;

namespace Ordovita.Infrastructure.Tasks.Persistence.Configuration;

public sealed class WorkCalendarConfiguration : IEntityTypeConfiguration<WorkCalendar>
{
    public void Configure(EntityTypeBuilder<WorkCalendar> builder)
    {
        builder.ToTable("Tasks.Calendars");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasConversion(id => id.Value, value => CalendarId.From(value));

        builder.Property(c => c.WorkspaceId)
            .HasConversion(id => id.Value, value => WorkspaceId.From(value))
            .IsRequired();

        builder.Property(c => c.IsPrimary).IsRequired();
        builder.Property(c => c.CreatedAt).IsRequired();
        builder.Property(c => c.UpdatedAt).IsRequired();

        builder.HasIndex(c => c.WorkspaceId).IsUnique();
    }
}