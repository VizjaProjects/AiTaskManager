using Microsoft.EntityFrameworkCore;
using Ordovita.Domain.Plan;
using Ordovita.Infrastructure.Persistence;

namespace Ordovita.Infrastructure.Plan.Persistence;

public sealed class PlanRepository(AppDbContext context) : IPlanRepository
{
    public async Task AddAsync(Domain.Plan.Plan plan, CancellationToken cancellationToken)
    {
        await context.Plans.AddAsync(plan, cancellationToken);
    }

    public async Task<Domain.Plan.Plan?> GetByIdAsync(PlanId id, CancellationToken cancellationToken)
    {
        return await context.Plans.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Domain.Plan.Plan>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await context.Plans.ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Domain.Plan.Plan>> GetAllActiveAsync(CancellationToken cancellationToken)
    {
        return await context.Plans.Where(p => p.IsActive == true).ToListAsync(cancellationToken);
    }

    public void Delete(Domain.Plan.Plan plan)
    {
        context.Remove(plan);
    }
}