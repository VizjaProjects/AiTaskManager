using Ordovita.Application.Abstraction.Identity;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.LlmStatistic;
using Ordovita.Domain.Plan;
using Ordovita.Domain.Workspace.port;

namespace Ordovita.Application.Plan;

public enum Action
{
    PlanAiTask,
    CreatePublicWorkspace,
    CreatePrivateWorkspace
}

public sealed class PlanLimitChecker(
    IUserContext context,
    IPlanRepository planRepository,
    IWorkspaceRepository workspaceRepository,
    ILlmStatisticRepository llmStatisticRepository,
    IUserRepository userRepository)
{

    public async Task<Result<bool>> Check(Action action, CancellationToken ct)
    {
        if (context.UserId == null)
            return Result.Failure<bool>(Error.Unauthorized("PlanLimitChecker", "Access denied"));

        var user = await userRepository.GetAsyncByAspId(context.UserId.Value.ToString(), ct);

        if (user == null)
            return Result.Failure<bool>(Error.NotFound("PlanLimitChecker", "User not found"));

        var plan = await planRepository.GetByIdAsync(user.PlanId, ct);

        if (plan == null)
            return Result.Failure<bool>(Error.NotFound("PlanLimitChecker", "Plan not found"));

        if (!plan.IsActive)
            return Result.Failure<bool>(Error.Validation("PlanLimitChecker", "Plan not active"));

        switch (action)
        {
            case Action.PlanAiTask:
            {
                var usage = await llmStatisticRepository.CountByRequestedAtAndRequestedBy(user.Id, ct);
                return Result.Success(usage < plan.AiTaskLimit);
            }
            case Action.CreatePublicWorkspace:
            {
                var count = await workspaceRepository.GetPublicWorkspaceCountAsync(user.Id, ct);
                return Result.Success(count < plan.PublicWorkspaceLimit);
            }
            case Action.CreatePrivateWorkspace:
            {
                var count = await workspaceRepository.GetPrivateWorkspaceCountAsync(user.Id, ct);
                return Result.Success(count < plan.PrivateWorkspaceLimit);
            }
            default:
                return Result.Failure<bool>(Error.NotFound("PlanLimitChecker", "Action not found"));
        }
    }
}