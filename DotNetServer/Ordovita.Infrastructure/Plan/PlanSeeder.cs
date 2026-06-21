using Microsoft.EntityFrameworkCore;
using Ordovita.Domain.Plan;
using Ordovita.Infrastructure.Persistence;

namespace Ordovita.Infrastructure.Plan;
public static class PlanSeeder
{
    public static async Task SeedAsync(AppDbContext db, CancellationToken ct = default)
    {
        var freeExists = await db.Plans.AnyAsync(p => p.Id == PlanDefaults.FreePlanId, ct);
        if (!freeExists)
        {
            var free = Domain.Plan.Plan.CreateSeed(
                PlanDefaults.FreePlanId,
                PlanDefaults.FreePlanName,
                PlanDefaults.FreeAiTaskLimit,
                PlanDefaults.FreePublicWorkspaceLimit,
                PlanDefaults.FreePrivateWorkspaceLimit,
                isActive: true);

            await db.Plans.AddAsync(free, ct);
            await db.SaveChangesAsync(ct);
        }

        var users = await db.DomainUser.ToListAsync(ct);
        var withoutPlan = users.Where(u => u.PlanId.Value == Guid.Empty).ToList();

        if (withoutPlan.Count > 0)
        {
            foreach (var user in withoutPlan)
                user.AssignPlan(PlanDefaults.FreePlanId);

            await db.SaveChangesAsync(ct);
        }
    }
}
