using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.TaskStatuses.CreateWorkTaskStatus;

public sealed record CreateWorkTaskStatusCommand(Guid WorkspaceId, string Name, string Color)
    : ICommand<CreateWorkTaskStatusResult>;

public sealed class CreateWorkTaskStatusHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkTaskStatusRepository statusRepository,
    IUnitOfWork uow) : ICommandHandler<CreateWorkTaskStatusCommand, CreateWorkTaskStatusResult>
{
    public async Task<Result<CreateWorkTaskStatusResult>> Handle(CreateWorkTaskStatusCommand command,
        CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<CreateWorkTaskStatusResult>(access.Error);

        var statusResult = WorkTaskStatus.Create(
            WorkspaceId.From(command.WorkspaceId), access.Value.User.Id, command.Name, command.Color);
        if (statusResult.IsFailure)
            return Result.Failure<CreateWorkTaskStatusResult>(statusResult.Error);

        await statusRepository.AddAsync(statusResult.Value!, ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success(new CreateWorkTaskStatusResult(
            statusResult.Value!.Id.Value, statusResult.Value.CreatedAt));
    }
}

public sealed class CreateWorkTaskStatusValidator : AbstractValidator<CreateWorkTaskStatusCommand>
{
    public CreateWorkTaskStatusValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Color).NotEmpty().MaximumLength(20);
    }
}