using FluentValidation;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.TaskStatuses.GetWorkspaceTaskStatuses;

public sealed record GetWorkspaceTaskStatusesQuery(Guid WorkspaceId) : IQuery<IReadOnlyList<WorkTaskStatusDto>>;

public sealed class GetWorkspaceTaskStatusesHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkTaskStatusRepository statusRepository) : IQueryHandler<GetWorkspaceTaskStatusesQuery, IReadOnlyList<WorkTaskStatusDto>>
{
    public async Task<Result<IReadOnlyList<WorkTaskStatusDto>>> Handle(
        GetWorkspaceTaskStatusesQuery query, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(query.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<IReadOnlyList<WorkTaskStatusDto>>(access.Error);

        var statuses = await statusRepository.GetByWorkspaceIdAsync(
            WorkspaceId.From(query.WorkspaceId), ct);

        return Result.Success<IReadOnlyList<WorkTaskStatusDto>>(
            statuses.Select(TaskMapper.ToDto).ToList());
    }
}

public sealed class GetWorkspaceTaskStatusesValidator : FluentValidation.AbstractValidator<GetWorkspaceTaskStatusesQuery>
{
    public GetWorkspaceTaskStatusesValidator() => RuleFor(x => x.WorkspaceId).NotEmpty();
}
