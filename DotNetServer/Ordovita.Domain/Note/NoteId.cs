using Ordovita.Domain.Common;

namespace Ordovita.Domain.Note;

public readonly record struct NoteId(Guid Value) : IEntityId<NoteId>
{
    public static NoteId New()
    {
        return new NoteId(Guid.CreateVersion7());
    }

    public static NoteId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("NoteId cannot be empty.", nameof(value));
        return new NoteId(value);
    }

    public override string ToString()
    {
        return Value.ToString();
    }
}