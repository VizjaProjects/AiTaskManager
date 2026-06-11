using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Note.Exception;
using Ordovita.Domain.Workspace;

namespace Ordovita.Domain.Note;

public class NoteFolder : AggregateRoot<NoteFolderId>
{
    public WorkspaceId WorkspaceId { get; private set; }
    public string NoteTitle { get; private set; }
    public UserId CreatedBy { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private NoteFolder()
    {
    }

    public static Result<NoteFolder> Create(WorkspaceId workspaceId, string noteTitle, UserId createdBy)
    {
        if (string.IsNullOrWhiteSpace(noteTitle))
            return Result.Failure<NoteFolder>(NoteException.MissingTitle);

        var folder = new NoteFolder
        {
            Id = NoteFolderId.New(),
            WorkspaceId = workspaceId,
            NoteTitle = noteTitle,
            CreatedBy = createdBy,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        return Result.Success(folder);
    }

    public void Update(string noteTitle)
    {
        NoteTitle = noteTitle;
        UpdatedAt = DateTime.UtcNow;
    }
}