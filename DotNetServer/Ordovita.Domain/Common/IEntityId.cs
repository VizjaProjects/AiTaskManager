namespace Ordovita.Domain.Common;

public interface IEntityId<TSelf>
    where TSelf : IEntityId<TSelf>
{
    Guid Value { get; }
    static abstract TSelf New();
    static abstract TSelf From(Guid value);
}