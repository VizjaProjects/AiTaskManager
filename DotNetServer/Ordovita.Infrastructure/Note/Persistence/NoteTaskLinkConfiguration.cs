using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Note;
using Ordovita.Domain.Tasks;

namespace Ordovita.Infrastructure.Note.Persistence;

public sealed class NoteTaskLinkConfiguration : IEntityTypeConfiguration<NoteTaskLink>
{
    public void Configure(EntityTypeBuilder<NoteTaskLink> builder)
    {
        builder.ToTable("Note.NoteTaskLinks");

        builder.HasKey(l => new { l.NoteId, l.TaskId });

        builder.Property(l => l.NoteId)
            .HasConversion(id => id.Value, value => NoteId.From(value));
        builder.Property(l => l.TaskId)
            .HasConversion(id => id.Value, value => TaskId.From(value));
        builder.Property(l => l.LinkedAt).IsRequired();

        builder.HasOne<WorkTask>()
            .WithMany()
            .HasForeignKey(l => l.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(l => l.TaskId);
    }
}