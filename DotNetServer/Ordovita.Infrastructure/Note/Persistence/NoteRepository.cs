using Microsoft.EntityFrameworkCore;
using Ordovita.Domain.Note;
using Ordovita.Domain.Note.Port;
using Ordovita.Domain.Workspace;
using Ordovita.Infrastructure.Persistence;

namespace Ordovita.Infrastructure.Note.Persistence;

public class NoteRepository(AppDbContext context) : INoteRepository
{
    public async Task AddAsync(Domain.Note.Note note, CancellationToken ct = default)
    {
        await context.AddAsync(note, ct);
    }

    public async Task<Domain.Note.Note?> GetByIdAsync(NoteId id, CancellationToken ct = default)
    {
        return await context.Set<Domain.Note.Note>().FirstOrDefaultAsync(n => n.Id == id, ct);
    }

    public async Task<IReadOnlyList<Domain.Note.Note>> GetByWorkspaceIdAsync(WorkspaceId workspaceId,
        CancellationToken ct = default)
    {
        return await context.Set<Domain.Note.Note>()
            .Where(n => n.WorkspaceId == workspaceId)
            .ToArrayAsync(ct);
    }

    public async Task<IReadOnlyList<Domain.Note.Note>> GetByFolderIdAsync(NoteFolderId folderId,
        CancellationToken ct = default)
    {
        return await context.Set<Domain.Note.Note>()
            .Where(n => n.NoteFolderId == folderId)
            .ToArrayAsync(ct);
    }

    public void Delete(Domain.Note.Note note)
    {
        context.Set<Domain.Note.Note>().Remove(note);
    }
}