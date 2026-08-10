using Ordovita.Domain.Common;

namespace Ordovita.Domain.Tasks;

public readonly record struct CommentId(Guid Value) : IEntityId<CommentId>
{
    public static CommentId New()
    {
        return new CommentId(Guid.CreateVersion7());
    }

    public static CommentId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("CommentId cannot be empty.", nameof(value));
        return new CommentId(value);
    }

    public override string ToString()
    {
        return Value.ToString();
    }
}