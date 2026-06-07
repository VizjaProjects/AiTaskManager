namespace Ordovita.Application.LlmSettings;

public sealed record LlmSettingsDto(Guid UserId, string Provider, string Model);