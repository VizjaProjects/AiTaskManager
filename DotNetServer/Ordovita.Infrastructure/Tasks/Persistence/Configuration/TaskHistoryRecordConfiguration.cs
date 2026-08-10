using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Tasks;

namespace Ordovita.Infrastructure.Tasks.Persistence.Configuration;

public sealed class TaskHistoryRecordConfiguration : IEntityTypeConfiguration<TaskHistoryRecord>
{
    public void Configure(EntityTypeBuilder<TaskHistoryRecord> builder)
    {
        builder.ToTable("Tasks.TaskHistoryRecords");

        builder.HasKey(record => record.Id);
        builder.Property(record => record.Id)
            .HasConversion(id => id.Value, value => TaskHistoryRecordId.From(value));
        builder.Property(record => record.TaskHistoryId)
            .HasConversion(id => id.Value, value => TaskHistoryId.From(value))
            .IsRequired();

        builder.Property(record => record.Field).HasMaxLength(100).IsRequired();
        builder.Property(record => record.PrevValue).HasMaxLength(2000).IsRequired();
        builder.Property(record => record.NextValue).HasMaxLength(2000).IsRequired();

        builder.HasIndex(record => record.TaskHistoryId);
    }
}