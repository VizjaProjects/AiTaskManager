using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Tasks;

namespace Ordovita.Infrastructure.Tasks.Persistence.Configuration;

public sealed class WorkTaskAssigneeConfiguration : IEntityTypeConfiguration<WorkTaskAssignee>
{
    public void Configure(EntityTypeBuilder<WorkTaskAssignee> builder)
    {
        builder.ToTable("Tasks.WorkTaskAssignees");

        builder.HasKey(a => new { a.TaskId, a.UserId });

        builder.Property(a => a.TaskId)
            .HasConversion(id => id.Value, value => TaskId.From(value));
        builder.Property(a => a.UserId)
            .HasConversion(id => id.Value, value => UserId.From(value));
        builder.Property(a => a.AssignedAt).IsRequired();

        builder.HasOne<DomainUser>()
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(a => a.UserId);
    }
}