namespace Ordovita.Application.Admin;

public sealed record AdminUserDto(
    Guid UserId,
    string FullName,
    string Email,
    string Role,
    bool IsEnable,
    Guid? PlanId,
    string? PlanName,
    bool PlanIsActive,
    int AiTaskUsage,
    int AiTaskLimit,
    int PublicWorkspaceUsage,
    int PublicWorkspaceLimit,
    int PrivateWorkspaceUsage,
    int PrivateWorkspaceLimit);
