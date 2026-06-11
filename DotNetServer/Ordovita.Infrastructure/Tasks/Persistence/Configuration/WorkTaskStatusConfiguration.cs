using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Workspace;

namespace Ordovita.Infrastructure.Tasks.Persistence.Configuration;

public sealed class WorkTaskStatusConfiguration : IEntityTypeConfiguration<WorkTaskStatus>
{
    public void Configure(EntityTypeBuilder<WorkTaskStatus> builder)
    {
        builder.ToTable("Tasks.Statuses");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasConversion(id => id.Value, value => TaskStatusId.From(value));

        builder.Property(s => s.WorkspaceId)
            .HasConversion(id => id.Value, value => WorkspaceId.From(value))
            .IsRequired();

        builder.Property(s => s.CreatedBy)
            .HasConversion(id => id.Value, value => UserId.From(value))
            .IsRequired();

        builder.Property(s => s.Name).HasMaxLength(100).IsRequired();
        builder.Property(s => s.Color).HasMaxLength(20).IsRequired();
        builder.Property(s => s.IsDefault).HasDefaultValue(false).IsRequired();
        builder.Property(s => s.CreatedAt).IsRequired();
        builder.Property(s => s.UpdatedAt).IsRequired();

        builder.HasIndex(s => s.WorkspaceId);
    }
}