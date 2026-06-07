using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ordovita.Infrastructure.Persistence;

namespace Ordovita.Infrastructure.Identity;

public static class DomainUserRoleSeeder
{
    public static async Task SyncAsync(
        AppDbContext db,
        UserManager<AspIdentityUser> userManager,
        CancellationToken ct = default)
    {
        var domainUsers = await db.DomainUser.AsNoTracking().ToListAsync(ct);

        foreach (var domainUser in domainUsers)
        {
            if (string.IsNullOrWhiteSpace(domainUser.AspIdentityUserId))
                continue;

            var aspUser = await userManager.FindByIdAsync(domainUser.AspIdentityUserId);
            if (aspUser is null)
                continue;

            var role = domainUser.Role.ToString();
            if (!await userManager.IsInRoleAsync(aspUser, role))
                await userManager.AddToRoleAsync(aspUser, role);
        }
    }
}