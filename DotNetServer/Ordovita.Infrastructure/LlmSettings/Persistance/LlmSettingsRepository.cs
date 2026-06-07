using Microsoft.EntityFrameworkCore;
using Ordovita.Domain.Identity;
using Ordovita.Domain.LlmSettings;
using Ordovita.Domain.LlmSettings.Port;
using Ordovita.Infrastructure.Persistence;

namespace Ordovita.Infrastructure.LlmSettings.Persistance;

public class LlmSettingsRepository(AppDbContext context) : ILlmSettingsRepository
{
    public async Task AddAsync(Domain.LlmSettings.LlmSettings llmSettings, CancellationToken ct = default)
    {
        await context.AddAsync(llmSettings, ct);
    }

    public async Task<Domain.LlmSettings.LlmSettings?> GetByIdAsync(LlmSettingsId llmSettingsId, UserId userId,
        CancellationToken ct = default)
    {
        return await context.LlmSettings.FirstOrDefaultAsync(l => l.Id == llmSettingsId && l.UserId == userId, ct);
    }

    public async Task<IReadOnlyList<Domain.LlmSettings.LlmSettings>> GetAllByUserIdAsync(UserId userId,
        CancellationToken ct = default)
    {
        return await context.LlmSettings.Where(l => l.UserId == userId).ToArrayAsync(ct);
    }

    public void Delete(Domain.LlmSettings.LlmSettings llmSettings)
    {
        context.LlmSettings.Remove(llmSettings);
    }
}