using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.TaskStatuses.EditWorkTaskStatus;

public sealed record EditWorkTaskStatusCommand(Guid WorkspaceId, Guid StatusId, string Name, string Color)
    : ICommand<EditWorkTaskStatusResult>;

public sealed class EditWorkTaskStatusHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkTaskStatusRepository statusRepository,
    IUnitOfWork uow) : ICommandHandler<EditWorkTaskStatusCommand, EditWorkTaskStatusResult>
{
    public async Task<Result<EditWorkTaskStatusResult>> Handle(EditWorkTaskStatusCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<EditWorkTaskStatusResult>(access.Error);

        var status = await statusRepository.GetByIdAsync(TaskStatusId.From(command.StatusId), ct);
        if (status is null || !status.BelongsToWorkspace(WorkspaceId.From(command.WorkspaceId)))
            return Result.Failure<EditWorkTaskStatusResult>(TaskStatusExceptions.NotFound);

        var editResult = status.Edit(command.Name, command.Color);
        if (editResult.IsFailure)
            return Result.Failure<EditWorkTaskStatusResult>(editResult.Error);

        await uow.SaveChangesAsync(ct);
        return Result.Success(new EditWorkTaskStatusResult(
            status.Id.Value, status.Name, status.Color, status.UpdatedAt));
    }
}

public sealed class EditWorkTaskStatusValidator : FluentValidation.AbstractValidator<EditWorkTaskStatusCommand>
{
    public EditWorkTaskStatusValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.StatusId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Color).NotEmpty().MaximumLength(20);
    }
}
