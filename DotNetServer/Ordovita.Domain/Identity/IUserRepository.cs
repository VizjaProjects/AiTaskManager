namespace Ordovita.Domain.Identity;

public interface IUserRepository
{
    Task AddAsync(DomainUser user, CancellationToken ct = default);

    Task<DomainUser?> GetAsyncByEmail(Email email, CancellationToken ct = default);

    Task<DomainUser?> GetAsyncByFullName(string fullName, CancellationToken ct = default);

    Task<DomainUser?> GetAsyncById(UserId id, CancellationToken ct = default);
    Task<IReadOnlyList<DomainUser>> GetAsyncByIds(IReadOnlyCollection<UserId> ids, CancellationToken ct = default);
    Task<bool> ExistsByEmail(Email email, CancellationToken ct = default);

    Task<DomainUser?> GetAsyncByAspId(string aspId, CancellationToken ct = default);
}