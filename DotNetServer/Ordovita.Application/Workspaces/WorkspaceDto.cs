namespace Ordovita.Application.Workspaces;

public sealed record WorkspaceUserDto(Guid UserId, DateTime AssignedAt);

public sealed record WorkspaceDto(
    Guid WorkspaceId,
    string WorkspaceName,
    Guid CreatedBy,
    IReadOnlyList<WorkspaceUserDto> AssignedUsers,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public static class WorkspaceMapper
{
    public static WorkspaceDto ToDto(Domain.Workspace.Workspace workspace)
    {
        return new WorkspaceDto(
            workspace.Id.Value,
            workspace.WorkspaceName,
            workspace.CreatedBy.Value,
            workspace.AssignedUsers
                .Select(u => new WorkspaceUserDto(u.UserId.Value, u.AssignedAt))
                .ToList(),
            workspace.CreatedAt,
            workspace.UpdatedAt);
    }
}