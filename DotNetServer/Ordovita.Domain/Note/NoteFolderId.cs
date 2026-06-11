using Ordovita.Domain.Common;

namespace Ordovita.Domain.Note;

public readonly record struct NoteFolderId(Guid Value) : IEntityId<NoteFolderId>
{
    public static NoteFolderId New()
    {
        return new NoteFolderId(Guid.CreateVersion7());
    }

    public static NoteFolderId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("v cannot be empty.", nameof(value));
        return new NoteFolderId(value);
    }

    public override string ToString()
    {
        return Value.ToString();
    }
}