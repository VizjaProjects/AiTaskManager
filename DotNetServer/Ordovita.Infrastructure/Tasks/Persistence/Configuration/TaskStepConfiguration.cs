using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Tasks;

namespace Ordovita.Infrastructure.Tasks.Persistence.Configuration;

public sealed class TaskStepConfiguration : IEntityTypeConfiguration<TaskStep>
{
    public void Configure(EntityTypeBuilder<TaskStep> builder)
    {
        builder.ToTable("Tasks.TaskSteps");

        builder.HasKey(step => step.Id);
        builder.Property(step => step.Id)
            .HasConversion(id => id.Value, value => TaskStepId.From(value));
        builder.Property(step => step.TaskId)
            .HasConversion(id => id.Value, value => TaskId.From(value))
            .IsRequired();
        builder.Property(step => step.AssignedUserId)
            .HasConversion(
                id => id.HasValue ? id.Value.Value : (Guid?)null,
                value => value.HasValue ? UserId.From(value.Value) : null);
        builder.Property(step => step.CreatedBy)
            .HasConversion(id => id.Value, value => UserId.From(value))
            .IsRequired();

        builder.Property(step => step.Title).HasMaxLength(WorkTask.StepTitleMaxLength).IsRequired();
        builder.Property(step => step.Position).IsRequired();
        builder.Property(step => step.Completed).IsRequired();
        builder.Property(step => step.Source).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(step => step.CreatedAt).IsRequired();
        builder.Property(step => step.UpdatedAt).IsRequired();

        builder.HasIndex(step => new { step.TaskId, step.Position });
    }
}
