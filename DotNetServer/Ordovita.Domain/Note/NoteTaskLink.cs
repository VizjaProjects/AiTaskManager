using Ordovita.Domain.Tasks;

namespace Ordovita.Domain.Note;

public class NoteTaskLink
{
    public NoteId NoteId { get; private set; }
    public TaskId TaskId { get; private set; }
    public DateTime LinkedAt { get; private set; }

    private NoteTaskLink()
    {
    }

    public static NoteTaskLink Create(NoteId noteId, TaskId taskId)
    {
        return new NoteTaskLink
        {
            NoteId = noteId,
            TaskId = taskId,
            LinkedAt = DateTime.UtcNow
        };
    }
}