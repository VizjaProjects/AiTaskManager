using Ordovita.Domain.Workspace;

namespace Ordovita.Domain.Note.Port;

public interface INoteFolderRepository
{
    Task AddAsync(NoteFolder folder, CancellationToken ct = default);
    Task<NoteFolder?> GetByIdAsync(NoteFolderId id, CancellationToken ct = default);
    Task<IReadOnlyList<NoteFolder>> GetByWorkspaceIdAsync(WorkspaceId workspaceId, CancellationToken ct = default);
    void Delete(NoteFolder folder);
}