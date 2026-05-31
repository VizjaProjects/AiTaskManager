using Ordovita.Domain.Common;

namespace Ordovita.Domain.Workspace;

public readonly record struct WorkspaceId(Guid Value) : IEntityId<WorkspaceId>
{
    public static WorkspaceId New()
    {
        return new WorkspaceId(Guid.CreateVersion7());
    }

    public static WorkspaceId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("WorkspaceId cannot be empty.", nameof(value));
        return new WorkspaceId(value);
    }

    public override string ToString()
    {
        return Value.ToString();
    }
}