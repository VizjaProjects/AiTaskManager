using System.Collections.Concurrent;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks;

public sealed class WorkspaceTaskEnsurer(
    IWorkCalendarRepository calendarRepository,
    IWorkTaskStatusRepository statusRepository,
    IWorkspaceTaskInitializer workspaceTaskInitializer,
    IUnitOfWork uow)
{
    private static readonly ConcurrentDictionary<Guid, SemaphoreSlim> Locks = new();

    public async Task EnsureInitializedAsync(WorkspaceId workspaceId, UserId userId, CancellationToken ct)
    {
        var gate = Locks.GetOrAdd(workspaceId.Value, _ => new SemaphoreSlim(1, 1));
        await gate.WaitAsync(ct);
        try
        {
            var calendar = await calendarRepository.GetByUserIdAsync(workspaceId, ct);
            var statuses = await statusRepository.GetByWorkspaceIdAsync(workspaceId, ct);
            if (calendar is not null && statuses.Count > 0)
                return;

            await workspaceTaskInitializer.InitializeAsync(workspaceId, userId, ct);
            await uow.SaveChangesAsync(ct);
        }
        finally
        {
            gate.Release();
        }
    }
}