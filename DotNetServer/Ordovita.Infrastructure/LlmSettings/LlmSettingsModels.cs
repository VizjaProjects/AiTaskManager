using LlmTornado.Chat.Models;
using Ordovita.Application.Abstraction.LlmSettings;
using Ordovita.Domain.Common;

namespace Ordovita.Infrastructure.LlmSettings;

public class LlmSettingsModels : ILlmSettingsModels
{
    public Result<IReadOnlyList<string>> GetAllModelsAsync(CancellationToken ct = default)
    {
        if (!ChatModel.AllModels.Any())
            return Result.Failure<IReadOnlyList<string>>(Error.NotFound("GetAllModelsAsync",
                "There are no models for this chat model."));

        IReadOnlyList<string> models = ChatModel.AllModels
            .Select(p => p.Name)
            .ToList()
            .AsReadOnly();

        return Result.Success(models);
    }
}