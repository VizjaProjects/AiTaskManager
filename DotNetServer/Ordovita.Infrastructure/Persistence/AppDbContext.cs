using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Domain.Identity;
using Ordovita.Infrastructure.Identity;

namespace Ordovita.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<AspIdentityUser>(options), IUnitOfWork
{
    public DbSet<DomainUser> DomainUser => Set<DomainUser>();


    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}