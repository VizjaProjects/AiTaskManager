using Ordovita.Domain.Common;

namespace Ordovita.Domain.Plan;

public static class PlanException
{
    public static readonly Error NotFound =
        Error.NotFound("Plan.Plan", "Plan was not found.");

    public static readonly Error MissingName =
        Error.Validation("Plan.MissingName", "Name is required.");

    public static readonly Error MissingAiTaskLimit =
        Error.Validation("Plan.AiTaskLimit", "Ai Task Limit is required.");

    public static readonly Error MissingPublicWorkspaceLimit =
        Error.Validation("Plan.PublicWorkspaceLimit", "Public Workspace Limit is required.");

    public static readonly Error MissingPrivateWorkspaceLimit =
        Error.Validation("Plan.PrivateWorkspaceLimit", "Private Workspace Limit is required.");
}