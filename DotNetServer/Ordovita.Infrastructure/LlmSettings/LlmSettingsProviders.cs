using LlmTornado.Code;
using Ordovita.Application.Abstraction.LlmSettings;
using Ordovita.Domain.Common;

namespace Ordovita.Infrastructure.LlmSettings;

public class LlmSettingsProviders : ILlmSettingsProviders
{
    public Result<IReadOnlyList<string>> GetAllProvidersAsync(CancellationToken ct = default)
    {
        var providersEnumsStrings = Enum.GetNames(typeof(LLmProviders));

        var providersList = new List<string>();

        foreach (var item in providersEnumsStrings)
            if (!string.IsNullOrWhiteSpace(item))
                providersList.Add(item);
        IReadOnlyList<string> readOnlyProvidersList = providersList.AsReadOnly();
        return Result.Success(readOnlyProvidersList);
    }
}