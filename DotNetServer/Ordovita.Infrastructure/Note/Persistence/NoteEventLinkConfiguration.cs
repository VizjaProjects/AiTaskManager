using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Note;
using Ordovita.Domain.Tasks;

namespace Ordovita.Infrastructure.Note.Persistence;

public sealed class NoteEventLinkConfiguration : IEntityTypeConfiguration<NoteEventLink>
{
    public void Configure(EntityTypeBuilder<NoteEventLink> builder)
    {
        builder.ToTable("Note.NoteEventLinks");

        builder.HasKey(l => new { l.NoteId, l.EventId });

        builder.Property(l => l.NoteId)
            .HasConversion(id => id.Value, value => NoteId.From(value));
        builder.Property(l => l.EventId)
            .HasConversion(id => id.Value, value => EventId.From(value));
        builder.Property(l => l.LinkedAt).IsRequired();

        builder.HasOne<CalendarEvent>()
            .WithMany()
            .HasForeignKey(l => l.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(l => l.EventId);
    }
}