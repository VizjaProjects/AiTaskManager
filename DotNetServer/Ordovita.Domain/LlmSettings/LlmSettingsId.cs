using Ordovita.Domain.Common;

namespace Ordovita.Domain.LlmSettings;

public readonly record struct LlmSettingsId(Guid Value) : IEntityId<LlmSettingsId>
{
    public static LlmSettingsId New()
    {
        return new LlmSettingsId(Guid.CreateVersion7());
    }

    public static LlmSettingsId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("LlmSettingsId cannot be empty.", nameof(value));
        return new LlmSettingsId(value);
    }

    public override string ToString()
    {
        return Value.ToString();
    }
}