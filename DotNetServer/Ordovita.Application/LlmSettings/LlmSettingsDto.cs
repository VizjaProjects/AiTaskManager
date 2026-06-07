namespace Ordovita.Application.LlmSettings;

public sealed record LlmSettingsDto(Guid LlmSettingsId, Guid UserId, string Provider, string Model);