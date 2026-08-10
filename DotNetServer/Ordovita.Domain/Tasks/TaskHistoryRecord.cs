using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks.Exception;

namespace Ordovita.Domain.Tasks;

public class TaskHistoryRecord : Entity<TaskHistoryRecordId>
{
    public TaskHistoryId TaskHistoryId { get; private set; }
    public string Field { get; private set; }
    public string PrevValue { get; private set; }
    public string NextValue { get; private set; }

    private TaskHistoryRecord()
    {
    }

    internal static Result<TaskHistoryRecord> Create(
        TaskHistoryId taskHistoryId, string field, string prevValue, string nextValue
    )
    {
        if (taskHistoryId.Value == Guid.Empty)
            return Result.Failure<TaskHistoryRecord>(TaskHistoryRecordExceptions.MissingTaskHistoryId);
        if (string.IsNullOrWhiteSpace(field))
            return Result.Failure<TaskHistoryRecord>(TaskHistoryRecordExceptions.MissingField);

        return Result.Success(new TaskHistoryRecord
        {
            Id = TaskHistoryRecordId.New(),
            TaskHistoryId = taskHistoryId,
            Field = field,
            PrevValue = prevValue ?? string.Empty,
            NextValue = nextValue ?? string.Empty
        });
    }
}