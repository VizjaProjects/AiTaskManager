using FluentValidation;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.WorkTasks.GetWorkspaceTasks;

public sealed record GetWorkspaceTasksQuery(Guid WorkspaceId) : IQuery<IReadOnlyList<WorkTaskDto>>;

public sealed class GetWorkspaceTasksHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkTaskRepository taskRepository) : IQueryHandler<GetWorkspaceTasksQuery, IReadOnlyList<WorkTaskDto>>
{
    public async Task<Result<IReadOnlyList<WorkTaskDto>>> Handle(GetWorkspaceTasksQuery query, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(query.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<IReadOnlyList<WorkTaskDto>>(access.Error);

        var tasks = await taskRepository.GetAcceptedByWorkspaceIdAsync(
            WorkspaceId.From(query.WorkspaceId), ct);

        return Result.Success<IReadOnlyList<WorkTaskDto>>(
            tasks.Select(TaskMapper.ToDto).ToList());
    }
}

public sealed class GetWorkspaceTasksValidator : AbstractValidator<GetWorkspaceTasksQuery>
{
    public GetWorkspaceTasksValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
    }
}