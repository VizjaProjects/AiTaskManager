using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Workspace;

namespace Ordovita.Infrastructure.Tasks.Persistence.Configuration;

public sealed class WorkTaskConfiguration : IEntityTypeConfiguration<WorkTask>
{
    public void Configure(EntityTypeBuilder<WorkTask> builder)
    {
        builder.ToTable("Tasks.WorkTasks");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasConversion(id => id.Value, value => TaskId.From(value));

        builder.Property(t => t.WorkspaceId)
            .HasConversion(id => id.Value, value => WorkspaceId.From(value))
            .IsRequired();

        builder.Property(t => t.CreatedBy)
            .HasConversion(id => id.Value, value => UserId.From(value))
            .IsRequired();

        builder.Property(t => t.Title).HasMaxLength(200).IsRequired();
        builder.Property(t => t.Description).HasMaxLength(2000);
        builder.Property(t => t.Priority).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(t => t.CategoryId)
            .HasConversion(
                id => id.HasValue ? id.Value.Value : (Guid?)null,
                value => value.HasValue ? TaskCategoryId.From(value.Value) : null);
        builder.Property(t => t.EstimatedDuration).IsRequired();
        builder.Property(t => t.StatusId)
            .HasConversion(id => id.Value, value => TaskStatusId.From(value))
            .IsRequired();
        builder.Property(t => t.Source).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(t => t.Accepted).IsRequired();
        builder.Property(t => t.CreatedAt).IsRequired();
        builder.Property(t => t.UpdatedAt).IsRequired();

        builder.HasIndex(t => t.WorkspaceId);
        builder.HasIndex(t => new { t.WorkspaceId, t.Accepted });

        builder.HasMany(t => t.AssignedUsers)
            .WithOne()
            .HasForeignKey(a => a.TaskId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Navigation(t => t.AssignedUsers).HasField("_assignedUsers");
        builder.Ignore(t => t.AssignedUserIds);

        builder.Ignore(t => t.DomainEvents);
    }
}