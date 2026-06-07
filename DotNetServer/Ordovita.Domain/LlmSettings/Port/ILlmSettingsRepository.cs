using Ordovita.Domain.Identity;

namespace Ordovita.Domain.LlmSettings.Port;

public interface ILlmSettingsRepository
{
    Task AddAsync(LlmSettings llmSettings, CancellationToken ct = default);
    Task<LlmSettings?> GetByIdAsync(LlmSettingsId llmSettingsId, UserId userId, CancellationToken ct = default);
    Task<IReadOnlyList<LlmSettings>> GetAllByUserIdAsync(UserId userId, CancellationToken ct = default);
    void Delete(LlmSettings llmSettings);
}