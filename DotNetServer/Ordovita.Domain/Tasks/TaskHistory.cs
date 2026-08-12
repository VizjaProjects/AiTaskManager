using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Tasks.Exception;

namespace Ordovita.Domain.Tasks;

public sealed class TaskHistory : AggregateRoot<TaskHistoryId>
{
    private readonly List<TaskHistoryRecord> _records = [];

    public TaskId TaskId { get; private set; }
    public UserId UserId { get; private set; }
    public HistoryAction Action { get; private set; }
    public short VersionNumber { get; private set; }
    public DateTime HistoryDate { get; private set; }

    public IReadOnlyCollection<TaskHistoryRecord> Records => _records;

    private TaskHistory()
    {
    }

    public static Result<TaskHistory> Create(
        TaskId taskId,
        UserId userId,
        HistoryAction action,
        short version,
        IReadOnlyList<TaskHistoryChange> changes)
    {
        if (userId.Value == Guid.Empty)
            return Result.Failure<TaskHistory>(TaskHistoryExceptions.MissingUserId);
        if (action == HistoryAction.UPDATE && changes.Count == 0)
            return Result.Failure<TaskHistory>(TaskHistoryExceptions.MissingTaskHistoryRecords);

        version++;

        var history = new TaskHistory
        {
            Id = TaskHistoryId.New(),
            TaskId = taskId,
            UserId = userId,
            Action = action,
            VersionNumber = version,
            HistoryDate = DateTime.UtcNow
        };

        foreach (var change in changes)
        {
            var recordResult = TaskHistoryRecord.Create(
                history.Id, change.Field, change.PrevValue, change.NextValue);
            if (recordResult.IsFailure || recordResult.Value is null)
                return Result.Failure<TaskHistory>(recordResult.Error);

            history._records.Add(recordResult.Value);
        }

        return Result.Success(history);
    }
}