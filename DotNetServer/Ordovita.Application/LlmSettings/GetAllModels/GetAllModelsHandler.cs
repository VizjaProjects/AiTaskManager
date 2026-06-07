using Ordovita.Application.Abstraction.LlmSettings;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;

namespace Ordovita.Application.LlmSettings.GetAllModels;

public sealed record GetAllModelsQuery : IQuery<IReadOnlyList<string>>;

public class GetAllModelsHandler(ILlmSettingsModels llmSettingsModels)
    : IQueryHandler<GetAllModelsQuery, IReadOnlyList<string>>
{
    public async Task<Result<IReadOnlyList<string>>> Handle(GetAllModelsQuery query, CancellationToken ct)
    {
        var result = llmSettingsModels.GetAllModelsAsync();

        if (!result.IsSuccess || result.Value == null)
            return Result.Failure<IReadOnlyList<string>>(result.Error);

        return Result.Success(result.Value);
    }
}