using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Note;
using Ordovita.Domain.Workspace;

namespace Ordovita.Infrastructure.Note.Persistence;

public class NoteFolderConfiguration : IEntityTypeConfiguration<NoteFolder>
{
    public void Configure(EntityTypeBuilder<NoteFolder> builder)
    {
        builder.ToTable("Note.NoteFolders");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id)
            .HasConversion(p => p.Value, value => NoteFolderId.From(value))
            .ValueGeneratedNever();

        builder.Property(p => p.WorkspaceId)
            .HasConversion(p => p.Value, value => WorkspaceId.From(value))
            .IsRequired();

        builder.Property(p => p.NoteTitle).HasMaxLength(255).IsRequired();

        builder.Property(p => p.Description).HasMaxLength(1000);

        builder.Property(p => p.CreatedBy)
            .HasConversion(p => p.Value, value => UserId.From(value))
            .IsRequired();

        builder.Property(p => p.CreatedAt).IsRequired();
        builder.Property(p => p.UpdatedAt).IsRequired();

        builder.HasIndex(p => p.WorkspaceId);
    }
}