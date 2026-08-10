using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Tasks;

namespace Ordovita.Infrastructure.Tasks.Persistence.Configuration;

public sealed class TaskHistoryConfiguration : IEntityTypeConfiguration<TaskHistory>
{
    public void Configure(EntityTypeBuilder<TaskHistory> builder)
    {
        builder.ToTable("Tasks.TaskHistories");

        builder.HasKey(history => history.Id);
        builder.Property(history => history.Id)
            .HasConversion(id => id.Value, value => TaskHistoryId.From(value));

        // TaskId is stored as a plain value (no FK to WorkTasks) so the audit
        // trail survives task deletion.
        builder.Property(history => history.TaskId)
            .HasConversion(id => id.Value, value => TaskId.From(value))
            .IsRequired();
        builder.Property(history => history.UserId)
            .HasConversion(id => id.Value, value => UserId.From(value))
            .IsRequired();

        builder.Property(history => history.Action).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(history => history.VersionNumber).IsRequired();
        builder.Property(history => history.HistoryDate).IsRequired();

        builder.HasMany(history => history.Records)
            .WithOne()
            .HasForeignKey(record => record.TaskHistoryId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Navigation(history => history.Records).HasField("_records");

        builder.HasIndex(history => new { history.TaskId, history.HistoryDate });

        builder.Ignore(history => history.DomainEvents);
    }
}