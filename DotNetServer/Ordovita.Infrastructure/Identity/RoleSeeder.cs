using Microsoft.AspNetCore.Identity;
using Ordovita.Domain.Identity;
using Ordovita.Infrastructure.Persistence;

namespace Ordovita.Infrastructure.Identity;

public static class RoleSeeder
{
    public static async Task SeedAsync(RoleManager<IdentityRole> roleManager)
    {
        foreach (var role in Enum.GetNames<Role>())
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
    }
}