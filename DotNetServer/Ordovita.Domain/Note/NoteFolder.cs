using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Note.Exception;
using Ordovita.Domain.Workspace;

namespace Ordovita.Domain.Note;

public class NoteFolder : AggregateRoot<NoteFolderId>
{
    public WorkspaceId WorkspaceId { get; private set; }
    public string NoteTitle { get; private set; }
    public string? Description { get; private set; }
    public UserId CreatedBy { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private NoteFolder()
    {
    }

    public static Result<NoteFolder> Create(WorkspaceId workspaceId, string noteTitle, UserId createdBy,
        string? description = null)
    {
        if (string.IsNullOrWhiteSpace(noteTitle))
            return Result.Failure<NoteFolder>(NoteException.MissingTitle);

        var folder = new NoteFolder
        {
            Id = NoteFolderId.New(),
            WorkspaceId = workspaceId,
            NoteTitle = noteTitle,
            Description = description,
            CreatedBy = createdBy,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        return Result.Success(folder);
    }

    public Result Update(string noteTitle, string? description)
    {
        if (string.IsNullOrWhiteSpace(noteTitle))
            return Result.Failure(NoteException.MissingTitle);

        NoteTitle = noteTitle;
        Description = description;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }
}