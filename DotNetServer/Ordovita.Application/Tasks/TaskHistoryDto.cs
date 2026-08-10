using Ordovita.Domain.Tasks;

namespace Ordovita.Application.Tasks;

public sealed record TaskHistoryDto(
    Guid HistoryId,
    Guid TaskId,
    Guid UserId,
    string Action,
    short VersionNumber,
    DateTime HistoryDate,
    IReadOnlyList<TaskHistoryRecordDto> Records);

public sealed record TaskHistoryRecordDto(
    Guid RecordId,
    string Field,
    string PrevValue,
    string NextValue);

public static class TaskHistoryMapper
{
    public static TaskHistoryDto ToDto(TaskHistory history)
    {
        return new TaskHistoryDto(
            history.Id.Value,
            history.TaskId.Value,
            history.UserId.Value,
            history.Action.ToString(),
            history.VersionNumber,
            history.HistoryDate,
            history.Records
                .Select(record => new TaskHistoryRecordDto(
                    record.Id.Value,
                    record.Field,
                    record.PrevValue,
                    record.NextValue))
                .ToList());
    }
}