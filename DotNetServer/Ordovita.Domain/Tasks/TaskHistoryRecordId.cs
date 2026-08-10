using Ordovita.Domain.Common;

namespace Ordovita.Domain.Tasks;

public readonly record struct TaskHistoryRecordId(Guid Value) : IEntityId<TaskHistoryRecordId>
{
    public static TaskHistoryRecordId New()
    {
        return new TaskHistoryRecordId(Guid.CreateVersion7());
    }

    public static TaskHistoryRecordId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("TaskHistoryRecordId cannot be empty.", nameof(value));
        return new TaskHistoryRecordId(value);
    }

    public override string ToString()
    {
        return Value.ToString();
    }
}