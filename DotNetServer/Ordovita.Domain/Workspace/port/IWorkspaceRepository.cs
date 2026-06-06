using Ordovita.Domain.Identity;
using WorkspaceAggregate = Ordovita.Domain.Workspace.Workspace;

namespace Ordovita.Domain.Workspace.port;

public interface IWorkspaceRepository
{
    Task AddAsync(WorkspaceAggregate workspace, CancellationToken ct = default);
    Task<WorkspaceAggregate?> GetByIdAsync(WorkspaceId id, CancellationToken ct = default);
    Task<IReadOnlyList<WorkspaceAggregate>> GetByCreatedByAsync(UserId createdBy, CancellationToken ct = default);
    void Delete(WorkspaceAggregate workspace);
}