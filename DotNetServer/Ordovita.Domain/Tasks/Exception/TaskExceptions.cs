using Ordovita.Domain.Common;

namespace Ordovita.Domain.Tasks.Exception;

public static class TaskExceptions
{
    public static readonly Error NotFound =
        Error.NotFound("Task.NotFound", "Task was not found.");

    public static readonly Error MissingTitle =
        Error.Validation("Task.MissingTitle", "Task title is required.");

    public static readonly Error MissingStatus =
        Error.Validation("Task.MissingStatus", "Task status is required.");

    public static readonly Error WrongWorkspace =
        Error.Validation("Task.WrongWorkspace", "Task does not belong to this workspace.");

    public static readonly Error NotPending =
        Error.Validation("Task.NotPending", "Task is not a pending AI proposal.");

    public static readonly Error AlreadyAssigned =
        Error.Validation("Task.AlreadyAssigned", "You cannot add user who  is already assigned.");

    public static readonly Error AssigneeNotWorkspaceMember =
        Error.Validation("Task.AssigneeNotWorkspaceMember",
            "You can only assign users who are members of the task's workspace.");
}

public static class EventExceptions
{
    public static readonly Error NotFound =
        Error.NotFound("Event.NotFound", "Event was not found.");

    public static readonly Error MissingTitle =
        Error.Validation("Event.MissingTitle", "Event title is required.");

    public static readonly Error MissingColor =
        Error.Validation("Event.MissingColor", "Event color is required.");

    public static readonly Error MissingDates =
        Error.Validation("Event.MissingDates", "Event start and end date times are required.");

    public static readonly Error WrongWorkspace =
        Error.Validation("Event.WrongWorkspace", "Event does not belong to this workspace.");

    public static readonly Error NotProposed =
        Error.Validation("Event.NotProposed", "Event is not a pending AI proposal.");
}

public static class CalendarExceptions
{
    public static readonly Error NotFound =
        Error.NotFound("Calendar.NotFound", "Calendar was not found for this workspace.");
}

public static class CategoryExceptions
{
    public static readonly Error NotFound =
        Error.NotFound("Category.NotFound", "Category was not found.");

    public static readonly Error MissingName =
        Error.Validation("Category.MissingName", "Category name is required.");

    public static readonly Error MissingColor =
        Error.Validation("Category.MissingColor", "Category color is required.");

    public static readonly Error LimitReached =
        Error.Validation("Category.LimitReached", "Category limit of 20 per workspace has been reached.");

    public static readonly Error WrongWorkspace =
        Error.Validation("Category.WrongWorkspace", "Category does not belong to this workspace.");
}

public static class TaskStatusExceptions
{
    public static readonly Error NotFound =
        Error.NotFound("TaskStatus.NotFound", "Task status was not found.");

    public static readonly Error MissingName =
        Error.Validation("TaskStatus.MissingName", "Task status name is required.");

    public static readonly Error MissingColor =
        Error.Validation("TaskStatus.MissingColor", "Task status color is required.");

    public static readonly Error WrongWorkspace =
        Error.Validation("TaskStatus.WrongWorkspace", "Task status does not belong to this workspace.");

    public static readonly Error CannotDeleteDefault =
        Error.Validation("TaskStatus.CannotDeleteDefault", "Default statuses cannot be deleted.");
}

public static class TaskStepExceptions
{
    public static readonly Error NotFound =
        Error.NotFound("TaskStep.NotFound", "Task step was not found.");

    public static readonly Error MissingTitle =
        Error.Validation("TaskStep.MissingTitle", "Task step title is required.");

    public static readonly Error TitleTooLong =
        Error.Validation("TaskStep.TitleTooLong", "Task step title cannot exceed 200 characters.");

    public static readonly Error LimitExceeded =
        Error.Validation("TaskStep.LimitExceeded", "A task cannot have more than 20 steps.");

    public static readonly Error InvalidOrder =
        Error.Validation("TaskStep.InvalidOrder", "Task step order must contain every current step exactly once.");

    public static readonly Error PendingTaskCannotBeCompleted =
        Error.Validation("TaskStep.PendingTaskCannotBeCompleted",
            "A step cannot be completed before its AI task proposal is accepted.");
}

public static class TaskCommentExceptions
{
    public static readonly Error NotFound =
        Error.NotFound("TaskComment.NotFound", "Comment was not found.");

    public static readonly Error MissingContent =
        Error.Validation("TaskComment.MissingContent", "Comment content is required.");

    public static readonly Error ContentTooLong =
        Error.Validation("TaskComment.ContentTooLong", "Comment cannot exceed 2000 characters.");

    public static readonly Error NotAuthor =
        Error.Validation("TaskComment.NotAuthor", "You can only modify your own comments.");
}

public static class TaskHistoryRecordExceptions
{
    public static readonly Error NotFound =
        Error.NotFound("TaskHistoryRecord.NotFound", "TaskHistoryRecord was not found.");

    public static readonly Error MissingTaskHistoryId =
        Error.Validation("TaskHistoryRecord.MissingTaskHistoryId", "TaskHistoryId content is required.");

    public static readonly Error MissingPrevValue =
        Error.Validation("TaskHistoryRecord.MissingPrevValue", "PrevValue content is required.");

    public static readonly Error MissingNextValue =
        Error.Validation("TaskHistoryRecord.MissingNextValue", "NextValue content is required.");

    public static readonly Error MissingField =
        Error.Validation("TaskHistoryRecord.MissingField", "Field is missing.");
}

public static class TaskHistoryExceptions
{
    public static readonly Error NotFound =
        Error.NotFound("TaskHistory.NotFound", "TaskHistory was not found.");

    public static readonly Error MissingTaskHistoryRecords =
        Error.Validation("TaskHistory.MissingTaskHistoryRecords", "Records are missing.");

    public static readonly Error MissingHistoryDate =
        Error.Validation("TaskHistory.MissingHistoryDate", "HistoryDate is required.");

    public static readonly Error MissingUserId =
        Error.Validation("TaskHistory.MissingUserId", "UserId is missing.");

    public static readonly Error MissingField =
        Error.Validation("TaskHistory.MissingField", "Fiels is missing.");
}