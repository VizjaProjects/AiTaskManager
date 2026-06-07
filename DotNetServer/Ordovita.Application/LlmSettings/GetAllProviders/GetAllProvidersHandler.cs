using Ordovita.Application.Abstraction.LlmSettings;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;

namespace Ordovita.Application.LlmSettings.GetAllProviders;

public sealed record GetAllProvidersQuery : IQuery<IReadOnlyList<string>>;

public class GetAllProvidersHandler(ILlmSettingsProviders llmSettingsProviders)
    : IQueryHandler<GetAllProvidersQuery, IReadOnlyList<string>>
{
    public async Task<Result<IReadOnlyList<string>>> Handle(GetAllProvidersQuery query, CancellationToken ct)
    {
        var result = llmSettingsProviders.GetAllProvidersAsync();

        if (result.IsFailure || result.Value == null) return Result.Failure<IReadOnlyList<string>>(result.Error);

        return Result.Success(result.Value);
    }
}