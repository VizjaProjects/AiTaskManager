using Ordovita.Domain.Common;

namespace Ordovita.Domain.LlmStatistic;

public readonly record struct LlmStatisticId(Guid Value) : IEntityId<LlmStatisticId>
{
    public static LlmStatisticId New()
    {
        return new LlmStatisticId(Guid.CreateVersion7());
    }

    public static LlmStatisticId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("LlmStatisticId cannot be empty.", nameof(value));
        return new LlmStatisticId(value);
    }

    public override string ToString()
    {
        return Value.ToString();
    }
}