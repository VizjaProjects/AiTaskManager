using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Workspace;
using Ordovita.Domain.Workspace.Exception;

namespace Ordovita.Domain.Tasks;

public sealed class WorkTask : AggregateRoot<TaskId>
{
    public const int MaxSteps = 20;
    public const int StepTitleMaxLength = 200;

    private readonly HashSet<WorkTaskAssignee> _assignedUsers = [];
    private readonly List<TaskStep> _steps = [];
    public WorkspaceId WorkspaceId { get; private set; }
    public UserId CreatedBy { get; private set; }
    public string Title { get; private set; } = null!;
    public string? Description { get; private set; }
    public TaskPriority Priority { get; private set; }
    public TaskCategoryId? CategoryId { get; private set; }
    public int EstimatedDuration { get; private set; }
    public DateTime? DueDateTime { get; private set; }
    public TaskStatusId StatusId { get; private set; }
    public TaskSource Source { get; private set; }
    public bool Accepted { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    public IReadOnlyCollection<WorkTaskAssignee> AssignedUsers => _assignedUsers;
    public IReadOnlyCollection<UserId> AssignedUserIds => _assignedUsers.Select(a => a.UserId).ToList();
    public IReadOnlyCollection<TaskStep> Steps => _steps;

    private WorkTask()
    {
    }

    public static Result<WorkTask> Create(
        WorkspaceId workspaceId,
        UserId createdBy,
        string title,
        string? description,
        TaskPriority priority,
        TaskCategoryId? categoryId,
        int estimatedDuration,
        DateTime? dueDateTime,
        TaskStatusId statusId,
        TaskSource source)
    {
        if (string.IsNullOrWhiteSpace(title))
            return Result.Failure<WorkTask>(TaskExceptions.MissingTitle);
        if (statusId.Value == Guid.Empty)
            return Result.Failure<WorkTask>(TaskExceptions.MissingStatus);

        var accepted = source != TaskSource.AI_PARSED;
        var now = DateTime.UtcNow;

        return Result.Success(new WorkTask
        {
            Id = TaskId.New(),
            WorkspaceId = workspaceId,
            CreatedBy = createdBy,
            Title = title,
            Description = description,
            Priority = priority,
            CategoryId = categoryId,
            EstimatedDuration = estimatedDuration,
            DueDateTime = dueDateTime,
            StatusId = statusId,
            Source = source,
            Accepted = accepted,
            CreatedAt = now,
            UpdatedAt = now
        });
    }

    public Result Edit(
        string title,
        string? description,
        TaskPriority priority,
        TaskCategoryId? categoryId,
        int estimatedDuration,
        DateTime? dueDateTime,
        TaskStatusId statusId)
    {
        if (string.IsNullOrWhiteSpace(title))
            return Result.Failure(TaskExceptions.MissingTitle);
        if (statusId.Value == Guid.Empty)
            return Result.Failure(TaskExceptions.MissingStatus);

        Title = title;
        Description = description;
        Priority = priority;
        CategoryId = categoryId;
        EstimatedDuration = estimatedDuration;
        DueDateTime = dueDateTime;
        StatusId = statusId;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public void Accept()
    {
        Accepted = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void ClearDueDateTime()
    {
        DueDateTime = null;
        UpdatedAt = DateTime.UtcNow;
    }

    public void EditDueDateTime(DateTime newDueDateTime)
    {
        DueDateTime = newDueDateTime;
        UpdatedAt = DateTime.UtcNow;
    }

    public bool BelongsToWorkspace(WorkspaceId workspaceId)
    {
        return WorkspaceId == workspaceId;
    }

    public Result AddUsersToTask(IEnumerable<UserId> userIds)
    {
        var newUsers = userIds.ToHashSet();
        if (newUsers.Count == 0)
            return Result.Success();

        if (newUsers.Any(u => _assignedUsers.Any(a => a.UserId == u)))
            return Result.Failure(TaskExceptions.AlreadyAssigned);

        foreach (var userId in newUsers)
            _assignedUsers.Add(WorkTaskAssignee.Create(Id, userId));

        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetAssignees(IEnumerable<UserId> userIds)
    {
        var desired = userIds.ToHashSet();

        _assignedUsers.RemoveWhere(a => !desired.Contains(a.UserId));

        var existing = _assignedUsers.Select(a => a.UserId).ToHashSet();
        foreach (var userId in desired)
            if (!existing.Contains(userId))
                _assignedUsers.Add(WorkTaskAssignee.Create(Id, userId));

        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result<TaskStep> AddStep(
        UserId createdBy,
        string title,
        TaskSource source,
        UserId? assignedUserId = null)
    {
        if (_steps.Count >= MaxSteps)
            return Result.Failure<TaskStep>(TaskStepExceptions.LimitExceeded);

        var result = TaskStep.Create(Id, createdBy, title, _steps.Count, source, assignedUserId);
        if (result.IsFailure || result.Value is null)
            return Result.Failure<TaskStep>(result.Error);

        _steps.Add(result.Value);
        UpdatedAt = DateTime.UtcNow;
        return Result.Success(result.Value);
    }

    public Result<TaskStep> UpdateStep(TaskStepId stepId, string title, UserId? assignedUserId)
    {
        var step = _steps.FirstOrDefault(candidate => candidate.Id == stepId);
        if (step is null)
            return Result.Failure<TaskStep>(TaskStepExceptions.NotFound);

        var result = step.Update(title, assignedUserId);
        if (result.IsFailure)
            return Result.Failure<TaskStep>(result.Error);

        UpdatedAt = DateTime.UtcNow;
        return Result.Success(step);
    }

    public Result<TaskStep> SetStepCompleted(TaskStepId stepId, bool completed)
    {
        var step = _steps.FirstOrDefault(candidate => candidate.Id == stepId);
        if (step is null)
            return Result.Failure<TaskStep>(TaskStepExceptions.NotFound);

        step.SetCompleted(completed);
        UpdatedAt = DateTime.UtcNow;
        return Result.Success(step);
    }

    public Result RemoveStep(TaskStepId stepId)
    {
        var step = _steps.FirstOrDefault(candidate => candidate.Id == stepId);
        if (step is null)
            return Result.Failure(TaskStepExceptions.NotFound);

        _steps.Remove(step);
        NormalizeStepPositions();
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result<IReadOnlyList<TaskStep>> ReorderSteps(IReadOnlyList<TaskStepId> orderedStepIds)
    {
        if (orderedStepIds.Count != _steps.Count || orderedStepIds.Distinct().Count() != _steps.Count)
            return Result.Failure<IReadOnlyList<TaskStep>>(TaskStepExceptions.InvalidOrder);

        var stepById = _steps.ToDictionary(step => step.Id);
        if (orderedStepIds.Any(stepId => !stepById.ContainsKey(stepId)))
            return Result.Failure<IReadOnlyList<TaskStep>>(TaskStepExceptions.InvalidOrder);

        _steps.Clear();
        for (var index = 0; index < orderedStepIds.Count; index++)
        {
            var step = stepById[orderedStepIds[index]];
            step.SetPosition(index);
            _steps.Add(step);
        }

        UpdatedAt = DateTime.UtcNow;
        return Result.Success<IReadOnlyList<TaskStep>>(_steps.OrderBy(step => step.Position).ToList());
    }

    private void NormalizeStepPositions()
    {
        for (var index = 0; index < _steps.Count; index++)
            _steps[index].SetPosition(index);
    }
}
