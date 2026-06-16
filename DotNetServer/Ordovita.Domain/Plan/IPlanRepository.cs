namespace Ordovita.Domain.Plan;

public interface IPlanRepository
{
    Task AddAsync(Plan plan, CancellationToken cancellationToken);
    Task<Plan?> GetByIdAsync(PlanId id, CancellationToken cancellationToken);
    Task<IReadOnlyList<Plan>> GetAllAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<Plan>> GetAllActiveAsync(CancellationToken cancellationToken);
    void Delete(Plan plan);
}