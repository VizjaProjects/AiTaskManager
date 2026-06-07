using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.LlmSettings;
using Ordovita.Domain.LlmSettings.Port;

namespace Ordovita.Application.LlmSettings.GetLlmSettingById;

public sealed record GetLlmSettingsByIdHandlerQuery(Guid LlmSettingId) : IQuery<LlmSettingsDto>;

public class GetLlmSettingsByIdHandler(ILlmSettingsRepository repository)
    : IQueryHandler<GetLlmSettingsByIdHandlerQuery, LlmSettingsDto>
{
    public async Task<Result<LlmSettingsDto>> Handle(GetLlmSettingsByIdHandlerQuery query, CancellationToken ct)
    {
        var llmSettingsId = LlmSettingsId.From(query.LlmSettingId);
        var llmSettings = await repository.GetByIdAsync(llmSettingsId, ct);

        if (llmSettings == null)
            return Result.Failure<LlmSettingsDto>(Error.NotFound("GetLlmSettingsByIdHandler",
                "Llm settings not found"));

        var dto = new LlmSettingsDto(llmSettings.Id.Value, llmSettings.UserId.Value, llmSettings.Provider,
            llmSettings.Model);


        return Result.Success(dto);
    }
}