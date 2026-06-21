using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Plan;

namespace Ordovita.Application.Plan.GetAllPlans;

public sealed record GetAllPlansQuery() : IQuery<IReadOnlyList<PlanDto>>;

public class GetAllPlansHandler(IPlanRepository planRepository)
    : IQueryHandler<GetAllPlansQuery, IReadOnlyList<PlanDto>>
{
    public async Task<Result<IReadOnlyList<PlanDto>>> Handle(GetAllPlansQuery query, CancellationToken ct)
    {
        var plans = await planRepository.GetAllAsync(ct);

        var result = plans
            .Select(p => new PlanDto(
                p.Id.Value,
                p.PlanName,
                p.AiTaskLimit,
                p.PublicWorkspaceLimit,
                p.PrivateWorkspaceLimit,
                p.IsActive))
            .ToList();

        return Result.Success<IReadOnlyList<PlanDto>>(result);
    }
}
