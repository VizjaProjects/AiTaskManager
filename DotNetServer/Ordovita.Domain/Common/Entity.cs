namespace Ordovita.Domain.Common;

public abstract class Entity<TId> where TId : struct, IEquatable<TId>
{
    public TId Id { get; protected set; }

    protected Entity()
    {
    }

    protected Entity(TId id)
    {
        Id = id;
    }

    public override bool Equals(object? obj)
    {
        return obj is Entity<TId> other && Id.Equals(other.Id);
    }

    public override int GetHashCode()
    {
        return Id.GetHashCode();
    }

    public static bool operator ==(Entity<TId>? a, Entity<TId>? b)
    {
        return a?.Equals(b) ?? b is null;
    }

    public static bool operator !=(Entity<TId>? a, Entity<TId>? b)
    {
        return !(a == b);
    }
}