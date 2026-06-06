using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.TaskStatuses.DeleteWorkTaskStatus;

public sealed record DeleteWorkTaskStatusCommand(Guid WorkspaceId, Guid StatusId) : ICommand<Unit>;

public sealed class DeleteWorkTaskStatusHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkTaskStatusRepository statusRepository,
    IUnitOfWork uow) : ICommandHandler<DeleteWorkTaskStatusCommand, Unit>
{
    public async Task<Result<Unit>> Handle(DeleteWorkTaskStatusCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<Unit>(access.Error);

        var status = await statusRepository.GetByIdAsync(TaskStatusId.From(command.StatusId), ct);
        if (status is null || !status.BelongsToWorkspace(WorkspaceId.From(command.WorkspaceId)))
            return Result.Failure<Unit>(TaskStatusExceptions.NotFound);

        statusRepository.Delete(status);
        await uow.SaveChangesAsync(ct);
        return Result.Success(Unit.Value);
    }
}

public sealed class DeleteWorkTaskStatusValidator : AbstractValidator<DeleteWorkTaskStatusCommand>
{
    public DeleteWorkTaskStatusValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.StatusId).NotEmpty();
    }
}