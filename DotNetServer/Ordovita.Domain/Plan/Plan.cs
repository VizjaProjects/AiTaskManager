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
        int privateWorkspaceLimit, bool isActive = false)

    {
        if (string.IsNullOrWhiteSpace(planName))
            return Result.Failure<Plan>(PlanException.MissingName);
        if (int.IsNegative(aiTaskLimit))
            return Result.Failure<Plan>(PlanException.MissingAiTaskLimit);
        if (int.IsNegative(publicWorkspaceLimit))
            return Result.Failure<Plan>(PlanException.MissingPublicWorkspaceLimit);
        if (int.IsNegative(privateWorkspaceLimit))
            return Result.Failure<Plan>(PlanException.MissingPrivateWorkspaceLimit);

        var plan = new Plan
        {
            Id = PlanId.New(),
            PlanName = planName,
            AiTaskLimit = aiTaskLimit,
            PublicWorkspaceLimit = publicWorkspaceLimit,
            PrivateWorkspaceLimit = privateWorkspaceLimit,
            IsActive = isActive
        };

        return Result.Success(plan);
    }

    public Result SetActive(bool isActive)
    {
        IsActive = isActive;
        return Result.Success();
    }

    public static Plan CreateSeed(PlanId id, string planName, int aiTaskLimit, int publicWorkspaceLimit,
        int privateWorkspaceLimit, bool isActive)
    {
        return new Plan
        {
            Id = id,
            PlanName = planName,
            AiTaskLimit = aiTaskLimit,
            PublicWorkspaceLimit = publicWorkspaceLimit,
            PrivateWorkspaceLimit = privateWorkspaceLimit,
            IsActive = isActive
        };
    }
}