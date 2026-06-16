namespace Ordovita.Application.Plan;

public sealed record PlanDto(
    Guid PlanId,
    string PlanName,
    int AiTaskLimit,
    int PublicWorkspaceLimit,
    int PrivateWorkspaceLimit);