using Ordovita.Domain.Common;

namespace Ordovita.Domain.Tasks;

public readonly record struct TaskHistoryId(Guid Value) : IEntityId<TaskHistoryId>
{
    public static TaskHistoryId New()
    {
        return new TaskHistoryId(Guid.CreateVersion7());
    }

    public static TaskHistoryId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("TaskHistoryId cannot be empty.", nameof(value));
        return new TaskHistoryId(value);
    }

    public override string ToString()
    {
        return Value.ToString();
    }
}