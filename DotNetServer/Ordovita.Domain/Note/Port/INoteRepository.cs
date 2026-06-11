using Ordovita.Domain.Workspace;

namespace Ordovita.Domain.Note.Port;

public interface INoteRepository
{
    Task AddAsync(Note note, CancellationToken ct = default);
    Task<Note?> GetByIdAsync(NoteId id, CancellationToken ct = default);
    Task<IReadOnlyList<Note>> GetByWorkspaceIdAsync(WorkspaceId workspaceId, CancellationToken ct = default);
    Task<IReadOnlyList<Note>> GetByFolderIdAsync(NoteFolderId folderId, CancellationToken ct = default);
    void Delete(Note note);
}