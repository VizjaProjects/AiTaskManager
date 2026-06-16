using Ordovita.Domain.Tasks;

namespace Ordovita.Domain.Note;

public class NoteEventLink
{
    public NoteId NoteId { get; private set; }
    public EventId EventId { get; private set; }
    public DateTime LinkedAt { get; private set; }

    private NoteEventLink()
    {
    }

    public static NoteEventLink Create(NoteId noteId, EventId eventId)
    {
        return new NoteEventLink
        {
            NoteId = noteId,
            EventId = eventId,
            LinkedAt = DateTime.UtcNow
        };
    }
}