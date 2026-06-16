using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Plan;

namespace Ordovita.Application.Plan.CreatePlan;

public sealed record CreatePlanCommand(
    string PlanName,
    int AiTaskLimit,
    int PublicWorkspaceLimit,
    int PrivateWorkspaceLimit) : ICommand<PlanDto>;

public class CreatePlanHandler(IPlanRepository planRepository, IUnitOfWork uow)
    : ICommandHandler<CreatePlanCommand, PlanDto>
{
    public async Task<Result<PlanDto>> Handle(CreatePlanCommand command, CancellationToken ct)
    {
        var plan = Domain.Plan.Plan.Create(command.PlanName, command.AiTaskLimit, command.PublicWorkspaceLimit,
            command.PrivateWorkspaceLimit);


        if (plan.IsFailure || plan.Value == null)
            return Result.Failure<PlanDto>(plan.Error);


        await planRepository.AddAsync(plan.Value, ct);
        await uow.SaveChangesAsync(ct);


        return Result.Success(new PlanDto(plan.Value.Id.Value, plan.Value.PlanName, plan.Value.AiTaskLimit,
            plan.Value.PublicWorkspaceLimit, plan.Value.PrivateWorkspaceLimit));
    }
}