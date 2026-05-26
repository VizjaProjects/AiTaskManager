using Ordovita.Domain.Common;

namespace Ordovita.Application.Abstraction.Identity;

public interface IAspIdentityService
{
    Task<Result<string>> CreateAspIdentityUserAsync(IServiceProvider sp, string email, string password,
        CancellationToken ct = default);
}