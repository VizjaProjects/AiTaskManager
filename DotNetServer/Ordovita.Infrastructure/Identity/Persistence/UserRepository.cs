using Microsoft.EntityFrameworkCore;
using Ordovita.Domain.Identity;
using Ordovita.Infrastructure.Persistence;

namespace Ordovita.Infrastructure.Identity.Persistence;

public sealed class UserRepository(AppDbContext context) : IUserRepository
{
    public async Task AddAsync(DomainUser user, CancellationToken ct = default)
    {
        await context.DomainUser.AddAsync(user, ct);
    }

    public async Task<DomainUser?> GetAsyncByEmail(Domain.Identity.Email email, CancellationToken ct = default)
    {
        return await context.DomainUser.FirstOrDefaultAsync(u => u.Email == email, ct);
    }

    public async Task<DomainUser?> GetAsyncByFullName(string fullName, CancellationToken ct = default)
    {
        return await context.DomainUser.FirstOrDefaultAsync(u => u.FullName == fullName, ct);
    }

    public async Task<DomainUser?> GetAsyncById(UserId id, CancellationToken ct = default)
    {
        return await context.DomainUser.FirstOrDefaultAsync(u => u.Id == id, ct);
    }

    public async Task<IReadOnlyList<DomainUser>> GetAsyncByIds(IReadOnlyCollection<UserId> ids,
        CancellationToken ct = default)
    {
        if (ids.Count == 0)
            return [];

        return await context.DomainUser
            .AsNoTracking()
            .Where(u => ids.Contains(u.Id))
            .ToListAsync(ct);
    }

    public async Task<bool> ExistsByEmail(Domain.Identity.Email email, CancellationToken ct = default)
    {
        return await context.DomainUser.AnyAsync(u => u.Email == email, ct);
    }

    public async Task<DomainUser?> GetAsyncByAspId(string aspId, CancellationToken ct = default)
    {
        return await context.DomainUser.FirstOrDefaultAsync(u => u.AspIdentityUserId == aspId, ct);
    }
}