using Ordovita.Domain.Common;

namespace Ordovita.Domain.Tasks;

public readonly record struct TaskStepId(Guid Value) : IEntityId<TaskStepId>
{
    public static TaskStepId New()
    {
        return new TaskStepId(Guid.CreateVersion7());
    }

    public static TaskStepId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("TaskStepId cannot be empty.", nameof(value));
        return new TaskStepId(value);
    }

    public override string ToString()
    {
        return Value.ToString();
    }
}