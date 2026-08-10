using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Tasks;

namespace Ordovita.Infrastructure.Tasks.Persistence.Configuration;

public sealed class TaskCommentConfiguration : IEntityTypeConfiguration<TaskComment>
{
    public void Configure(EntityTypeBuilder<TaskComment> builder)
    {
        builder.ToTable("Tasks.TaskComments");

        builder.HasKey(comment => comment.Id);
        builder.Property(comment => comment.Id)
            .HasConversion(id => id.Value, value => CommentId.From(value));
        builder.Property(comment => comment.TaskId)
            .HasConversion(id => id.Value, value => TaskId.From(value))
            .IsRequired();
        builder.Property(comment => comment.AuthorId)
            .HasConversion(id => id.Value, value => UserId.From(value))
            .IsRequired();

        builder.Property(comment => comment.Content).HasMaxLength(WorkTask.CommentMaxLength).IsRequired();
        builder.Property(comment => comment.CreatedAt).IsRequired();
        builder.Property(comment => comment.UpdatedAt).IsRequired();

        builder.HasIndex(comment => new { comment.TaskId, comment.CreatedAt });
    }
}