namespace Ordovita.Domain.Plan;

public static class PlanDefaults
{
    public const string FreePlanName = "Free";

    public static readonly PlanId FreePlanId =
        PlanId.From(Guid.Parse("11111111-1111-1111-1111-111111111111"));

    public const int FreeAiTaskLimit = 15;
    public const int FreePublicWorkspaceLimit = 3;
    public const int FreePrivateWorkspaceLimit = 3;
}
