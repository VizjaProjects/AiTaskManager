using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
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
    IReadOnlyList<CreateTaskStepInput> Steps) : ICommand<CreateWorkTaskResult>;

public sealed class CreateWorkTaskHandler(
    WorkspaceAccessGuard accessGuard,
    IWorkTaskRepository taskRepository,
    IWorkCalendarRepository calendarRepository,
    ICalendarEventRepository eventRepository,
    IWorkTaskStatusRepository statusRepository,
    ITaskCategoryRepository categoryRepository,
    ITaskHistoryRepository historyRepository,
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

        string? categoryName = null;
        if (command.CategoryId is { } categoryIdValue)
        {
            var category = await categoryRepository.GetByIdAsync(TaskCategoryId.From(categoryIdValue), ct);
            if (category is null || !category.BelongsToWorkspace(workspaceId))
                return Result.Failure<CreateWorkTaskResult>(CategoryExceptions.NotFound);
            categoryName = category.Name;
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
            TaskSource.MANUAL);

        if (taskResult.IsFailure || taskResult.Value is null)
            return Result.Failure<CreateWorkTaskResult>(taskResult.Error);

        var memberIds = access.Value.Workspace.AssignedUsers.Select(member => member.UserId).ToHashSet();
        foreach (var stepInput in command.Steps)
        {
            UserId? assignedUserId = null;
            if (stepInput.AssignedUserId is { } requestedUserId)
            {
                assignedUserId = UserId.From(requestedUserId);
                if (!memberIds.Contains(assignedUserId.Value))
                    return Result.Failure<CreateWorkTaskResult>(TaskExceptions.AssigneeNotWorkspaceMember);
            }

            var stepResult = taskResult.Value.AddStep(
                access.Value.User.Id,
                stepInput.Title,
                TaskSource.MANUAL,
                assignedUserId);
            if (stepResult.IsFailure)
                return Result.Failure<CreateWorkTaskResult>(stepResult.Error);
        }

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

        var createdTask = taskResult.Value!;
        var historyChanges = new List<TaskHistoryChange>
        {
            new("Title", string.Empty, createdTask.Title),
            new("Priority", string.Empty, createdTask.Priority.ToString()),
            new("Status", string.Empty, status.Name),
            new("EstimatedDuration", string.Empty, createdTask.EstimatedDuration.ToString())
        };
        if (!string.IsNullOrWhiteSpace(createdTask.Description))
            historyChanges.Add(new TaskHistoryChange("Description", string.Empty, createdTask.Description!));
        if (categoryName is not null)
            historyChanges.Add(new TaskHistoryChange("Category", string.Empty, categoryName));
        if (createdTask.DueDateTime is { } createdDue)
            historyChanges.Add(new TaskHistoryChange("DueDateTime", string.Empty, createdDue.ToString("o")));

        var historyResult = TaskHistory.Create(
            createdTask.Id, access.Value.User.Id, HistoryAction.CREATE, 0, historyChanges);
        if (historyResult.IsFailure || historyResult.Value is null)
            return Result.Failure<CreateWorkTaskResult>(historyResult.Error);
        await historyRepository.AddAsync(historyResult.Value, ct);

        await uow.SaveChangesAsync(ct);
        return Result.Success(new CreateWorkTaskResult(taskResult.Value!.Id.Value, taskResult.Value.CreatedAt));
    }
}