using Ordovita.Domain.Common;

namespace Ordovita.Domain.Identity;

public readonly record struct UserId(Guid Value) : IEntityId<UserId>
{
    public static UserId New()
    {
        return new UserId(Guid.CreateVersion7());
    }

    public static UserId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("UserId cannot be empty.", nameof(value));
        return new UserId(value);
    }

    public override string ToString()
    {
        return Value.ToString();
    }
}