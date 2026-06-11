using Microsoft.EntityFrameworkCore;
using Ordovita.Domain.Note;
using Ordovita.Domain.Note.Port;
using Ordovita.Domain.Workspace;
using Ordovita.Infrastructure.Persistence;

namespace Ordovita.Infrastructure.Note.Persistence;

public class NoteFolderRepository(AppDbContext context) : INoteFolderRepository
{
    public async Task AddAsync(NoteFolder folder, CancellationToken ct = default)
    {
        await context.AddAsync(folder, ct);
    }

    public async Task<NoteFolder?> GetByIdAsync(NoteFolderId id, CancellationToken ct = default)
    {
        return await context.Set<NoteFolder>().FirstOrDefaultAsync(f => f.Id == id, ct);
    }

    public async Task<IReadOnlyList<NoteFolder>> GetByWorkspaceIdAsync(WorkspaceId workspaceId,
        CancellationToken ct = default)
    {
        return await context.Set<NoteFolder>()
            .Where(f => f.WorkspaceId == workspaceId)
            .ToArrayAsync(ct);
    }

    public void Delete(NoteFolder folder)
    {
        context.Set<NoteFolder>().Remove(folder);
    }
}