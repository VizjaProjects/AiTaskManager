using Ordovita.Domain.Identity;
using DomainUserEntity = Ordovita.Domain.Identity.DomainUser;

namespace Ordovita.Application.Workspaces;

public sealed record WorkspaceUserDto(Guid UserId, string? Email, string? FullName, DateTime AssignedAt);

public sealed record WorkspaceDto(
    Guid WorkspaceId,
    string WorkspaceName,
    Guid CreatedBy,
    IReadOnlyList<WorkspaceUserDto> AssignedUsers,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public static class WorkspaceMapper
{
    public static WorkspaceDto ToDto(
        Domain.Workspace.Workspace workspace,
        IReadOnlyDictionary<UserId, DomainUserEntity>? users = null)
    {
        return new WorkspaceDto(
            workspace.Id.Value,
            workspace.WorkspaceName,
            workspace.CreatedBy.Value,
            workspace.AssignedUsers
                .Select(u =>
                {
                    DomainUserEntity? user = null;
                    users?.TryGetValue(u.UserId, out user);
                    return new WorkspaceUserDto(
                        u.UserId.Value,
                        user?.Email.Value,
                        user?.FullName,
                        u.AssignedAt);
                })
                .ToList(),
            workspace.CreatedAt,
            workspace.UpdatedAt);
    }

    public static async Task<WorkspaceDto> ToDtoAsync(
        Domain.Workspace.Workspace workspace,
        IUserRepository userRepository,
        CancellationToken ct)
    {
        var userIds = workspace.AssignedUsers.Select(u => u.UserId).Distinct().ToList();
        var users = await userRepository.GetAsyncByIds(userIds, ct);
        var lookup = users.ToDictionary(u => u.Id);
        return ToDto(workspace, lookup);
    }

    public static async Task<IReadOnlyList<WorkspaceDto>> ToDtoListAsync(
        IReadOnlyCollection<Domain.Workspace.Workspace> workspaces,
        IUserRepository userRepository,
        CancellationToken ct)
    {
        var userIds = workspaces
            .SelectMany(w => w.AssignedUsers.Select(u => u.UserId))
            .Distinct()
            .ToList();
        var users = await userRepository.GetAsyncByIds(userIds, ct);
        var lookup = users.ToDictionary(u => u.Id);
        return workspaces.Select(w => ToDto(w, lookup)).ToList();
    }
}