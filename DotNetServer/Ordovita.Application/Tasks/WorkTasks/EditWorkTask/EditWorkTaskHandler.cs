using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
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
    ITaskHistoryRepository historyRepository,
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

        var oldTitle = task.Title;
        var oldDescription = task.Description ?? string.Empty;
        var oldPriority = task.Priority;
        var oldEstimated = task.EstimatedDuration;
        var oldDueDate = task.DueDateTime;
        var oldStatusId = task.StatusId;
        var oldCategoryId = task.CategoryId;

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
                    command.Title, start, command.DueDateTime.Value, false, EventStatus.ACCEPTED, existingEvent.Color);
                if (eventEdit.IsFailure)
                    return Result.Failure<EditWorkTaskResult>(eventEdit.Error);
            }
        }

        await RecordHistoryAsync(
            task,
            access.Value.User.Id,
            oldTitle,
            oldDescription,
            oldPriority,
            oldEstimated,
            oldDueDate,
            oldStatusId,
            oldCategoryId,
            status,
            categoryForEdit,
            ct);

        await uow.SaveChangesAsync(ct);
        return Result.Success(new EditWorkTaskResult(task.Id.Value, task.UpdatedAt));
    }

    private async Task RecordHistoryAsync(
        WorkTask task,
        UserId userId,
        string oldTitle,
        string oldDescription,
        TaskPriority oldPriority,
        int oldEstimated,
        DateTime? oldDueDate,
        TaskStatusId oldStatusId,
        TaskCategoryId? oldCategoryId,
        WorkTaskStatus newStatus,
        TaskCategoryId? newCategoryId,
        CancellationToken ct)
    {
        var changes = new List<TaskHistoryChange>();

        if (oldTitle != task.Title)
            changes.Add(new TaskHistoryChange("Title", oldTitle, task.Title));
        if (oldDescription != (task.Description ?? string.Empty))
            changes.Add(new TaskHistoryChange("Description", oldDescription, task.Description ?? string.Empty));
        if (oldPriority != task.Priority)
            changes.Add(new TaskHistoryChange("Priority", oldPriority.ToString(), task.Priority.ToString()));
        if (oldEstimated != task.EstimatedDuration)
            changes.Add(new TaskHistoryChange(
                "EstimatedDuration", oldEstimated.ToString(), task.EstimatedDuration.ToString()));
        if (oldDueDate != task.DueDateTime)
            changes.Add(new TaskHistoryChange(
                "DueDateTime",
                oldDueDate?.ToString("o") ?? string.Empty,
                task.DueDateTime?.ToString("o") ?? string.Empty));

        if (oldStatusId != newStatus.Id)
        {
            var oldStatus = await statusRepository.GetByIdAsync(oldStatusId, ct);
            changes.Add(new TaskHistoryChange("Status", oldStatus?.Name ?? string.Empty, newStatus.Name));
        }

        if (oldCategoryId != newCategoryId)
        {
            var oldName = oldCategoryId is { } oldCat
                ? (await categoryRepository.GetByIdAsync(oldCat, ct))?.Name ?? string.Empty
                : string.Empty;
            var newName = newCategoryId is { } newCat
                ? (await categoryRepository.GetByIdAsync(newCat, ct))?.Name ?? string.Empty
                : string.Empty;
            changes.Add(new TaskHistoryChange("Category", oldName, newName));
        }

        if (changes.Count == 0)
            return;

        var version = await historyRepository.GetNextVersionAsync(task.Id, ct);
        var historyResult = TaskHistory.Create(task.Id, userId, HistoryAction.UPDATE, version, changes);
        if (historyResult.IsSuccess && historyResult.Value is not null)
            await historyRepository.AddAsync(historyResult.Value, ct);
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