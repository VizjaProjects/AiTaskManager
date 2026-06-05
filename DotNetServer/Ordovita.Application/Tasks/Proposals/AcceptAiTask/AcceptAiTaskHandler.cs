using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Tasks;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.Proposals.AcceptAiTask;

public sealed record AcceptAiTaskCommand(
    Guid WorkspaceId,
    Guid TaskId,
    string Title,
    string? Description,
    TaskPriority Priority,
    Guid? CategoryId,
    int EstimatedDuration,
    DateTime? DueDateTime,
    Guid StatusId) : ICommand<AcceptAiTaskResult>;

public sealed class AcceptAiTaskHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkTaskRepository taskRepository,
    IWorkCalendarRepository calendarRepository,
    ICalendarEventRepository eventRepository,
    IWorkTaskStatusRepository statusRepository,
    ITaskCategoryRepository categoryRepository,
    IUnitOfWork uow) : ICommandHandler<AcceptAiTaskCommand, AcceptAiTaskResult>
{
    public async Task<Result<AcceptAiTaskResult>> Handle(AcceptAiTaskCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<AcceptAiTaskResult>(access.Error);

        var workspaceId = WorkspaceId.From(command.WorkspaceId);
        var task = await taskRepository.GetByIdAsync(TaskId.From(command.TaskId), ct);
        if (task is null || !task.BelongsToWorkspace(workspaceId))
            return Result.Failure<AcceptAiTaskResult>(TaskExceptions.NotFound);
        if (task.Accepted)
            return Result.Failure<AcceptAiTaskResult>(TaskExceptions.NotPending);

        var status = await statusRepository.GetByIdAsync(TaskStatusId.From(command.StatusId), ct);
        if (status is null || !status.BelongsToWorkspace(workspaceId))
            return Result.Failure<AcceptAiTaskResult>(TaskStatusExceptions.NotFound);

        if (command.CategoryId is { } categoryIdValue)
        {
            var category = await categoryRepository.GetByIdAsync(TaskCategoryId.From(categoryIdValue), ct);
            if (category is null || !category.BelongsToWorkspace(workspaceId))
                return Result.Failure<AcceptAiTaskResult>(CategoryExceptions.NotFound);
        }

        var editResult = task.Edit(
            command.Title,
            command.Description,
            command.Priority,
            command.CategoryId.HasValue ? TaskCategoryId.From(command.CategoryId.Value) : null,
            command.EstimatedDuration,
            command.DueDateTime,
            TaskStatusId.From(command.StatusId));
        if (editResult.IsFailure)
            return Result.Failure<AcceptAiTaskResult>(editResult.Error);

        task.Accept();

        var existingEvents = await eventRepository.GetByTaskIdAllAsync(task.Id, ct);
        if (existingEvents.Count > 0)
        {
            foreach (var calendarEvent in existingEvents)
                calendarEvent.Accept();
        }
        else if (command.DueDateTime is not null)
        {
            var calendar = await calendarRepository.GetPrimaryByWorkspaceIdAsync(workspaceId, ct);
            if (calendar is null)
                return Result.Failure<AcceptAiTaskResult>(CalendarExceptions.NotFound);

            var start = command.DueDateTime.Value.AddMinutes(-command.EstimatedDuration);
            var eventResult = CalendarEvent.Create(
                task.Id, task.Title, start, command.DueDateTime.Value, false, ProposedBy.USER, calendar.Id);
            if (eventResult.IsFailure)
                return Result.Failure<AcceptAiTaskResult>(eventResult.Error);

            eventResult.Value!.Accept();
            await eventRepository.AddAsync(eventResult.Value, ct);
        }

        await uow.SaveChangesAsync(ct);
        return Result.Success(new AcceptAiTaskResult(task.Id.Value, task.UpdatedAt));
    }
}

public sealed class AcceptAiTaskValidator : AbstractValidator<AcceptAiTaskCommand>
{
    public AcceptAiTaskValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.TaskId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.StatusId).NotEmpty();
        RuleFor(x => x.EstimatedDuration).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Priority).IsInEnum();
    }
}
