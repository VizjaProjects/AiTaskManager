using Ordovita.Domain.Common;

namespace Ordovita.Domain.Tasks;

public readonly record struct CalendarId(Guid Value) : IEntityId<CalendarId>
{
    public static CalendarId New() => new(Guid.CreateVersion7());

    public static CalendarId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("CalendarId cannot be empty.", nameof(value));
        return new CalendarId(value);
    }

    public override string ToString() => Value.ToString();
}
