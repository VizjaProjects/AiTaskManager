using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;

namespace Ordovita.Domain.Tasks;

public readonly record struct TaskId(Guid Value) : IEntityId<TaskId>
{
    public static TaskId New()
    {
        return new TaskId(Guid.CreateVersion7());
    }

    public static TaskId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("TaskId cannot be empty.", nameof(value));
        return new TaskId(value);
    }

    public override string ToString()
    {
        return Value.ToString();
    }
}