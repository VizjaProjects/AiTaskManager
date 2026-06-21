namespace Ordovita.Application.Plan;

public sealed record UserPlanUsageDto(
    Guid PlanId,
    string PlanName,
    bool IsActive,
    int AiTaskLimit,
    int AiTaskUsage,
    int PublicWorkspaceLimit,
    int PublicWorkspaceUsage,
    int PrivateWorkspaceLimit,
    int PrivateWorkspaceUsage);
