using FluentValidation;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Tasks;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.Proposals.GetPendingProposals;

public sealed record GetPendingProposalsQuery(Guid WorkspaceId) : IQuery<PendingProposalsDto>;

public sealed class GetPendingProposalsHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkTaskRepository taskRepository,
    IWorkCalendarRepository calendarRepository,
    ICalendarEventRepository eventRepository) : IQueryHandler<GetPendingProposalsQuery, PendingProposalsDto>
{
    public async Task<Result<PendingProposalsDto>> Handle(GetPendingProposalsQuery query, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(query.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<PendingProposalsDto>(access.Error);

        var workspaceId = WorkspaceId.From(query.WorkspaceId);
        var calendar = await calendarRepository.GetPrimaryByWorkspaceIdAsync(workspaceId, ct);
        if (calendar is null)
            return Result.Failure<PendingProposalsDto>(CalendarExceptions.NotFound);

        var pendingTasks = await taskRepository.GetPendingByWorkspaceIdAsync(workspaceId, ct);
        var pendingEvents = await eventRepository.GetProposedByCalendarIdAsync(calendar.Id, ct);

        return Result.Success(new PendingProposalsDto(
            pendingTasks.Select(TaskMapper.ToPendingDto).ToList(),
            pendingEvents.Select(TaskMapper.ToPendingDto).ToList()));
    }
}

public sealed class GetPendingProposalsValidator : AbstractValidator<GetPendingProposalsQuery>
{
    public GetPendingProposalsValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
    }
}