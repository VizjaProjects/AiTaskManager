using Microsoft.EntityFrameworkCore;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Workspace;
using Ordovita.Domain.Workspace.port;
using Ordovita.Infrastructure.Persistence;
using WorkspaceAggregate = Ordovita.Domain.Workspace.Workspace;

namespace Ordovita.Infrastructure.Workspace.Persistance;

public sealed class WorkspaceRepository(AppDbContext context) : IWorkspaceRepository
{
    public async Task AddAsync(WorkspaceAggregate workspace, CancellationToken ct = default)
    {
        await context.Workspaces.AddAsync(workspace, ct);
    }

    public async Task<WorkspaceAggregate?> GetByIdAsync(WorkspaceId id, CancellationToken ct = default)
    {
        return await context.Workspaces
            .Include(w => w.AssignedUsers)
            .FirstOrDefaultAsync(w => w.Id == id, ct);
    }

    public async Task<IReadOnlyList<WorkspaceAggregate>> GetByCreatedByAsync(UserId createdBy, CancellationToken ct = default)
    {
        return await context.Workspaces
            .AsNoTracking()
            .Include(w => w.AssignedUsers)
            .Where(w => w.CreatedBy == createdBy)
            .ToListAsync(ct);
    }

    public void Delete(WorkspaceAggregate workspace)
    {
        context.Workspaces.Remove(workspace);
    }
}
