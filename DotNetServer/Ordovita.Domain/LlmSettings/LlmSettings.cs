using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.LlmSettings.Excpetion;

namespace Ordovita.Domain.LlmSettings;

public class LlmSettings : AggregateRoot<LlmSettingsId>
{
    public UserId UserId { get; private set; }
    public string ApiKey { get; set; }
    public string? Provider { get; private set; }
    public string Model { get; private set; }
    public Uri? CustomUrl { get; set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private LlmSettings()
    {
    }

    public static Result<LlmSettings> Create(UserId userId, string apiKey, string? provider, string model,
        Uri? customUrl)
    {
        if (string.IsNullOrEmpty(apiKey)) return Result.Failure<LlmSettings>(LlmSettingsException.MissingApiKey);
        if (string.IsNullOrEmpty(model)) return Result.Failure<LlmSettings>(LlmSettingsException.MissingModel);

        var llmSettings = new LlmSettings
        {
            Id = LlmSettingsId.New(),
            UserId = userId,
            ApiKey = apiKey,
            Provider = provider,
            Model = model,
            CustomUrl = customUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        return Result.Success(llmSettings);
    }


    public Result<LlmSettings> Update(UserId userId, string apiKey, string? provider, string model, Uri? customUrl,
        UserId? accessUser)
    {
        if (accessUser != UserId) return Result.Failure<LlmSettings>(LlmSettingsException.AccessDenied);
        UserId = userId;
        ApiKey = apiKey;
        Provider = provider;
        Model = model;
        CustomUrl = customUrl;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success(this);
    }

    public Result Delete(UserId accessUser)
    {
        if (accessUser != UserId) return Result.Failure(LlmSettingsException.AccessDenied);
        return Result.Success();
    }
}