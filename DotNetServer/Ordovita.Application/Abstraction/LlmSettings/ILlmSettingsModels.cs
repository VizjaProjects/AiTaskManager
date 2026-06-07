using Ordovita.Domain.Common;

namespace Ordovita.Application.Abstraction.LlmSettings;

public interface ILlmSettingsModels
{
    Result<IReadOnlyList<string>> GetAllModelsAsync(CancellationToken ct = default);
}