using Ordovita.Domain.Common;

namespace Ordovita.Application.Abstraction.LlmSettings;

public interface ILlmSettingsProviders
{
    Result<IReadOnlyList<string>> GetAllProvidersAsync(CancellationToken ct = default);
}