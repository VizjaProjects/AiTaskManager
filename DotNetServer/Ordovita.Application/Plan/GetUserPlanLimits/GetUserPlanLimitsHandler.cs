using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.LlmStatistic;
using Ordovita.Domain.Plan;
using Ordovita.Domain.Workspace.port;

namespace Ordovita.Application.Plan.GetUserPlanLimits;

public sealed record GetUserPlanLimitsQuery() : IQuery<UserPlanUsageDto>;

public class GetUserPlanLimitsHandler(
    IUserContext context,
    IPlanRepository planRepository,
    IUserRepository userRepository,
    IWorkspaceRepository workspaceRepository,
    ILlmStatisticRepository llmStatisticRepository) : IQueryHandler<GetUserPlanLimitsQuery, UserPlanUsageDto>
{
    public async Task<Result<UserPlanUsageDto>> Handle(GetUserPlanLimitsQuery query, CancellationToken ct)
    {
        if (context.UserId == null)
            return Result.Failure<UserPlanUsageDto>(Error.Unauthorized("GetUserPlanLimitsQuery",
                "Access denied"));

        var user = await userRepository.GetAsyncByAspId(context.UserId.Value.ToString(), ct);

        if (user == null)
            return Result.Failure<UserPlanUsageDto>(Error.NotFound("GetUserPlanLimitsQuery",
                "User not found"));

        if (user.PlanId.Value == Guid.Empty)
            return Result.Failure<UserPlanUsageDto>(Error.NotFound("GetUserPlanLimitsQuery",
                "User has empty Plan Id"));

        var plan = await planRepository.GetByIdAsync(user.PlanId, ct);

        if (plan == null)
            return Result.Failure<UserPlanUsageDto>(Error.NotFound("GetUserPlanLimitsQuery", "Plan not found"));

        var aiTaskUsage = await llmStatisticRepository.CountByRequestedAtAndRequestedBy(user.Id, ct);
        var publicWorkspaceUsage = await workspaceRepository.GetPublicWorkspaceCountAsync(user.Id, ct);
        var privateWorkspaceUsage = await workspaceRepository.GetPrivateWorkspaceCountAsync(user.Id, ct);

        return Result.Success(new UserPlanUsageDto(
            plan.Id.Value,
            plan.PlanName,
            plan.IsActive,
            plan.AiTaskLimit,
            aiTaskUsage,
            plan.PublicWorkspaceLimit,
            publicWorkspaceUsage,
            plan.PrivateWorkspaceLimit,
            privateWorkspaceUsage));
    }
}