using FluentValidation;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.History.GetTaskHistory;

public sealed record GetTaskHistoryQuery(Guid WorkspaceId, Guid TaskId) : IQuery<IReadOnlyList<TaskHistoryDto>>;

public sealed class GetTaskHistoryHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkTaskRepository taskRepository,
    ITaskHistoryRepository historyRepository) : IQueryHandler<GetTaskHistoryQuery, IReadOnlyList<TaskHistoryDto>>
{
    public async Task<Result<IReadOnlyList<TaskHistoryDto>>> Handle(GetTaskHistoryQuery query, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(query.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<IReadOnlyList<TaskHistoryDto>>(access.Error);

        var task = await taskRepository.GetByIdAsync(TaskId.From(query.TaskId), ct);
        if (task is null || !task.BelongsToWorkspace(WorkspaceId.From(query.WorkspaceId)))
            return Result.Failure<IReadOnlyList<TaskHistoryDto>>(TaskExceptions.NotFound);

        var history = await historyRepository.GetByTaskIdAsync(TaskId.From(query.TaskId), ct);
        return Result.Success<IReadOnlyList<TaskHistoryDto>>(
            history.Select(TaskHistoryMapper.ToDto).ToList());
    }
}

public sealed class GetTaskHistoryValidator : AbstractValidator<GetTaskHistoryQuery>
{
    public GetTaskHistoryValidator()
    {
        RuleFor(query => query.WorkspaceId).NotEmpty();
        RuleFor(query => query.TaskId).NotEmpty();
    }
}