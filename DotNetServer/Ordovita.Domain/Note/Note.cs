using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Note.Exception;
using Ordovita.Domain.Workspace;

namespace Ordovita.Domain.Note;

public class Note : AggregateRoot<NoteId>
{
    public WorkspaceId WorkspaceId { get; private set; }
    public NoteFolderId? NoteFolderId { get; set; }
    public string Title { get; private set; }
    public string NoteColor { get; private set; }
    public NoteContent Content { get; private set; }
    public string? NoteDescription { get; private set; }
    public UserId CreatedBy { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }


    private Note()
    {
    }

    public static Result<Note> Create(WorkspaceId workspaceId, string title, string noteColor,
        NoteContent content, UserId createdBy, NoteFolderId? noteFolderId, string? noteDescription)
    {
        if (string.IsNullOrWhiteSpace(title))
            return Result.Failure<Note>(NoteException.MissingTitle);
        if (string.IsNullOrWhiteSpace(noteColor))
            return Result.Failure<Note>(NoteException.MissingNoteColor);

        var note = new Note
        {
            Id = NoteId.New(),
            WorkspaceId = workspaceId,
            Title = title,
            NoteColor = noteColor,
            Content = content,
            CreatedBy = createdBy,
            NoteFolderId = noteFolderId,
            NoteDescription = noteDescription,
            CreatedAt =  DateTime.UtcNow,
            UpdatedAt =  DateTime.UtcNow
        };

        return Result.Success(note);
    }

    public void UpdateContent(NoteContent newContent)
    {
        Content = newContent;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateMetadata(string title, string noteColor, NoteFolderId? noteFolderId, string noteDescription)
    {
        Title = title;
        NoteColor = noteColor;
        NoteFolderId = noteFolderId;
        UpdatedAt = DateTime.UtcNow;
        NoteDescription = noteDescription;
    }
}