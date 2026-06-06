using Ordovita.Domain.Common;

namespace Ordovita.Domain.Tasks;

public readonly record struct EventId(Guid Value) : IEntityId<EventId>
{
    public static EventId New()
    {
        return new EventId(Guid.CreateVersion7());
    }

    public static EventId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("EventId cannot be empty.", nameof(value));
        return new EventId(value);
    }

    public override string ToString()
    {
        return Value.ToString();
    }
}