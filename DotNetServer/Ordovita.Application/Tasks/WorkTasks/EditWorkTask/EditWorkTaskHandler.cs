using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.WorkTasks.EditWorkTask;

public sealed record EditWorkTaskCommand(
    Guid WorkspaceId,
    Guid TaskId,
    string Title,
    string? Description,
    TaskPriority Priority,
    Guid? CategoryId,
    int EstimatedDuration,
    DateTime? DueDateTime,
    Guid StatusId) : ICommand<EditWorkTaskResult>;

public sealed class EditWorkTaskHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkTaskRepository taskRepository,
    IWorkCalendarRepository calendarRepository,
    ICalendarEventRepository eventRepository,
    IWorkTaskStatusRepository statusRepository,
    ITaskCategoryRepository categoryRepository,
    IUnitOfWork uow) : ICommandHandler<EditWorkTaskCommand, EditWorkTaskResult>
{
    public async Task<Result<EditWorkTaskResult>> Handle(EditWorkTaskCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<EditWorkTaskResult>(access.Error);

        var workspaceId = WorkspaceId.From(command.WorkspaceId);
        var task = await taskRepository.GetByIdAsync(TaskId.From(command.TaskId), ct);
        if (task is null || !task.BelongsToWorkspace(workspaceId))
            return Result.Failure<EditWorkTaskResult>(TaskExceptions.NotFound);

        var status = await statusRepository.GetByIdAsync(TaskStatusId.From(command.StatusId), ct);
        if (status is null || !status.BelongsToWorkspace(workspaceId))
            return Result.Failure<EditWorkTaskResult>(TaskStatusExceptions.NotFound);

        var categoryForEdit = await ResolveCategoryForEditAsync(
            command.CategoryId, task.CategoryId, workspaceId, categoryRepository, ct);

        var previousDueDate = task.DueDateTime;
        var editResult = task.Edit(
            command.Title,
            command.Description,
            command.Priority,
            categoryForEdit,
            command.EstimatedDuration,
            command.DueDateTime,
            TaskStatusId.From(command.StatusId));

        if (editResult.IsFailure)
            return Result.Failure<EditWorkTaskResult>(editResult.Error);

        var calendar = await calendarRepository.GetPrimaryByWorkspaceIdAsync(workspaceId, ct);
        if (calendar is null)
            return Result.Failure<EditWorkTaskResult>(CalendarExceptions.NotFound);

        if (command.DueDateTime is not null && previousDueDate is null)
        {
            var start = command.DueDateTime.Value.AddMinutes(-command.EstimatedDuration);
            var eventResult = CalendarEvent.Create(
                task.Id, task.Title, start, command.DueDateTime.Value, false, ProposedBy.USER, calendar.Id);
            if (eventResult.IsFailure)
                return Result.Failure<EditWorkTaskResult>(eventResult.Error);
            await eventRepository.AddAsync(eventResult.Value!, ct);
        }
        else if (previousDueDate is not null && command.DueDateTime is not null)
        {
            var existingEvent = await eventRepository.GetByTaskIdAsync(task.Id, ct);
            var start = command.DueDateTime.Value.AddMinutes(-command.EstimatedDuration);
            if (existingEvent is null)
            {
                var eventResult = CalendarEvent.Create(
                    task.Id, task.Title, start, command.DueDateTime.Value, false, ProposedBy.USER, calendar.Id);
                if (eventResult.IsFailure)
                    return Result.Failure<EditWorkTaskResult>(eventResult.Error);
                await eventRepository.AddAsync(eventResult.Value!, ct);
            }
            else
            {
                var eventEdit = existingEvent.Edit(
                    command.Title, start, command.DueDateTime.Value, false, EventStatus.ACCEPTED);
                if (eventEdit.IsFailure)
                    return Result.Failure<EditWorkTaskResult>(eventEdit.Error);
            }
        }

        await uow.SaveChangesAsync(ct);
        return Result.Success(new EditWorkTaskResult(task.Id.Value, task.UpdatedAt));
    }

    private static async Task<TaskCategoryId?> ResolveCategoryForEditAsync(
        Guid? requestedCategoryId,
        TaskCategoryId? currentCategoryId,
        WorkspaceId workspaceId,
        ITaskCategoryRepository categoryRepository,
        CancellationToken ct)
    {
        if (requestedCategoryId is not { } categoryId || categoryId == Guid.Empty)
            return currentCategoryId;

        var category = await categoryRepository.GetByIdAsync(TaskCategoryId.From(categoryId), ct);
        if (category is not null && category.BelongsToWorkspace(workspaceId))
            return TaskCategoryId.From(categoryId);

        return currentCategoryId;
    }
}