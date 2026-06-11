using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Note;
using Ordovita.Domain.Workspace;

namespace Ordovita.Infrastructure.Note.Persistence;

public class NoteConfiguration : IEntityTypeConfiguration<Domain.Note.Note>
{
    public void Configure(EntityTypeBuilder<Domain.Note.Note> builder)
    {
        builder.ToTable("Note.Notes");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id)
            .HasConversion(p => p.Value, value => NoteId.From(value))
            .ValueGeneratedNever();

        builder.Property(p => p.WorkspaceId)
            .HasConversion(p => p.Value, value => WorkspaceId.From(value))
            .IsRequired();

        builder.Property(p => p.NoteFolderId)
            .HasConversion(
                noteFolderId => noteFolderId == null
                    ? (Guid?)null
                    : noteFolderId.Value.Value,
                value => value.HasValue
                    ? NoteFolderId.From(value.Value)
                    : null
            )
            .IsRequired(false);

        builder.Property(p => p.Title).HasMaxLength(255).IsRequired();
        builder.Property(p => p.NoteColor).HasMaxLength(7).IsRequired();

        builder.Property(p => p.NoteDescription).HasMaxLength(255);

        builder.Property(p => p.Content)
            .HasConversion(p => p.RawJson, value => NoteContent.FromJson(value))
            .HasColumnType("json")
            .IsRequired();

        builder.Property(p => p.CreatedBy)
            .HasConversion(p => p.Value, value => UserId.From(value))
            .IsRequired();

        builder.Property(p => p.CreatedAt).IsRequired();
        builder.Property(p => p.UpdatedAt).IsRequired();

        builder.HasIndex(p => p.WorkspaceId);
        builder.HasIndex(p => p.NoteFolderId);
    }
}