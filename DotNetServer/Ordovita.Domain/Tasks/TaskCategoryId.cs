using Ordovita.Domain.Common;

namespace Ordovita.Domain.Tasks;

public readonly record struct TaskCategoryId(Guid Value) : IEntityId<TaskCategoryId>
{
    public static TaskCategoryId New()
    {
        return new TaskCategoryId(Guid.CreateVersion7());
    }

    public static TaskCategoryId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("TaskCategoryId cannot be empty.", nameof(value));
        return new TaskCategoryId(value);
    }

    public override string ToString()
    {
        return Value.ToString();
    }
}