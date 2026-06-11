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
}

public static class EventExceptions
{
    public static readonly Error NotFound =
        Error.NotFound("Event.NotFound", "Event was not found.");

    public static readonly Error MissingTitle =
        Error.Validation("Event.MissingTitle", "Event title is required.");

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