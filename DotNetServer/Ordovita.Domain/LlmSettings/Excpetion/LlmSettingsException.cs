using Ordovita.Domain.Common;

namespace Ordovita.Domain.LlmSettings.Excpetion;

public class LlmSettingsException
{
    public static readonly Error NotFound =
        Error.NotFound("LlmSettings.NotFound", "Task was not found.");

    public static readonly Error MissingApiKey =
        Error.Validation("LlmSettings.ApiKey", "Api Key is required.");

    public static readonly Error MissingProvider =
        Error.Validation("LlmSettings.Provider", "Provider is required.");

    public static readonly Error MissingModel =
        Error.Validation("LlmSettings.Model", "Model is required.");

    public static readonly Error AccessDenied =
        Error.Validation("LlmSettings.AccessDenied", "Access denied to this resource! ");
}