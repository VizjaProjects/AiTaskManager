using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.WorkTasks.CreateWorkTask;

public sealed record CreateWorkTaskCommand(
    Guid WorkspaceId,
    string Title,
    string? Description,
    TaskPriority Priority,
    Guid? CategoryId,
    int EstimatedDuration,
    DateTime? DueDateTime,
    Guid StatusId,
    TaskSource Source) : ICommand<CreateWorkTaskResult>;

public sealed class CreateWorkTaskHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkTaskRepository taskRepository,
    IWorkCalendarRepository calendarRepository,
    ICalendarEventRepository eventRepository,
    IWorkTaskStatusRepository statusRepository,
    ITaskCategoryRepository categoryRepository,
    IUnitOfWork uow) : ICommandHandler<CreateWorkTaskCommand, CreateWorkTaskResult>
{
    public async Task<Result<CreateWorkTaskResult>> Handle(CreateWorkTaskCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<CreateWorkTaskResult>(access.Error);

        var workspaceId = WorkspaceId.From(command.WorkspaceId);
        var status = await statusRepository.GetByIdAsync(TaskStatusId.From(command.StatusId), ct);
        if (status is null || !status.BelongsToWorkspace(workspaceId))
            return Result.Failure<CreateWorkTaskResult>(TaskStatusExceptions.NotFound);

        if (command.CategoryId is { } categoryIdValue)
        {
            var category = await categoryRepository.GetByIdAsync(TaskCategoryId.From(categoryIdValue), ct);
            if (category is null || !category.BelongsToWorkspace(workspaceId))
                return Result.Failure<CreateWorkTaskResult>(CategoryExceptions.NotFound);
        }

        var taskResult = WorkTask.Create(
            workspaceId,
            access.Value.User.Id,
            command.Title,
            command.Description,
            command.Priority,
            command.CategoryId.HasValue ? TaskCategoryId.From(command.CategoryId.Value) : null,
            command.EstimatedDuration,
            command.DueDateTime,
            TaskStatusId.From(command.StatusId),
            command.Source);

        if (taskResult.IsFailure || taskResult.Value is null)
            return Result.Failure<CreateWorkTaskResult>(taskResult.Error);

        if (taskResult.Value.Source == TaskSource.MANUAL)
            taskResult.Value.Accept();

        await taskRepository.AddAsync(taskResult.Value!, ct);

        if (command.DueDateTime is not null)
        {
            var calendar = await calendarRepository.GetPrimaryByWorkspaceIdAsync(workspaceId, ct);
            if (calendar is null)
                return Result.Failure<CreateWorkTaskResult>(CalendarExceptions.NotFound);

            var end = command.DueDateTime.Value.AddMinutes(command.EstimatedDuration);
            var eventResult = CalendarEvent.Create(
                taskResult.Value!.Id,
                taskResult.Value.Title,
                command.DueDateTime.Value,
                end,
                false,
                ProposedBy.USER,
                calendar.Id);

            if (eventResult.IsFailure)
                return Result.Failure<CreateWorkTaskResult>(eventResult.Error);

            await eventRepository.AddAsync(eventResult.Value!, ct);
        }

        await uow.SaveChangesAsync(ct);
        return Result.Success(new CreateWorkTaskResult(taskResult.Value!.Id.Value, taskResult.Value.CreatedAt));
    }
}