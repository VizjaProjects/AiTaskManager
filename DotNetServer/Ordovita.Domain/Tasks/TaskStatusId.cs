using Ordovita.Domain.Common;

namespace Ordovita.Domain.Tasks;

public readonly record struct TaskStatusId(Guid Value) : IEntityId<TaskStatusId>
{
    public static TaskStatusId New()
    {
        return new TaskStatusId(Guid.CreateVersion7());
    }

    public static TaskStatusId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("TaskStatusId cannot be empty.", nameof(value));
        return new TaskStatusId(value);
    }

    public override string ToString()
    {
        return Value.ToString();
    }
}