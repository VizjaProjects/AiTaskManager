using Ordovita.Domain.Common;

namespace Ordovita.Domain.Plan;

public class Plan : AggregateRoot<PlanId>
{
    public string PlanName { get; private set; }
    public int AiTaskLimit { get; private set; }
    public int PublicWorkspaceLimit { get; private set; }
    public int PrivateWorkspaceLimit { get; private set; }
    public bool IsActive { get; private set; }


    private Plan()
    {
    }

    public static Result<Plan> Create(string planName, int aiTaskLimit, int publicWorkspaceLimit,
        int privateWorkspaceLimit)

    {
        if (int.IsNegative(aiTaskLimit) || aiTaskLimit.Equals(null))
            return Result.Failure<Plan>(PlanException.MissingAiTaskLimit);
        if (string.IsNullOrWhiteSpace(planName))
            return Result.Failure<Plan>(PlanException.MissingAiTaskLimit);
        if (int.IsNegative(publicWorkspaceLimit) || publicWorkspaceLimit.Equals(null))
            return Result.Failure<Plan>(PlanException.MissingPublicWorkspaceLimit);
        if (int.IsNegative(privateWorkspaceLimit) || privateWorkspaceLimit.Equals(null))
            return Result.Failure<Plan>(PlanException.MissingPrivateWorkspaceLimit);

        var plan = new Plan
        {
            Id = PlanId.New(),
            PlanName = planName,
            AiTaskLimit = aiTaskLimit,
            PublicWorkspaceLimit = publicWorkspaceLimit,
            PrivateWorkspaceLimit = privateWorkspaceLimit,
            IsActive = false
        };

        return Result.Success(plan);
    }
}