using Ordovita.Api.Common;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Tasks;
using Ordovita.Application.Tasks.Categories.CreateTaskCategory;
using Ordovita.Application.Tasks.Categories.DeleteTaskCategory;
using Ordovita.Application.Tasks.Categories.EditTaskCategory;
using Ordovita.Application.Tasks.Categories.GetWorkspaceCategories;
using Ordovita.Application.Tasks.Events.CreateCalendarEvent;
using Ordovita.Application.Tasks.Events.DeleteCalendarEvent;
using Ordovita.Application.Tasks.Events.EditCalendarEvent;
using Ordovita.Application.Tasks.Events.GetWorkspaceEvents;
using Ordovita.Application.Tasks.TaskStatuses.CreateWorkTaskStatus;
using Ordovita.Application.Tasks.TaskStatuses.DeleteWorkTaskStatus;
using Ordovita.Application.Tasks.TaskStatuses.EditWorkTaskStatus;
using Ordovita.Application.Tasks.TaskStatuses.GetWorkspaceTaskStatuses;
using Ordovita.Application.Tasks.WorkTasks.CreateWorkTask;
using Ordovita.Application.Tasks.WorkTasks.DeleteWorkTask;
using Ordovita.Application.Tasks.WorkTasks.AssignUsersToTask;
using Ordovita.Application.Tasks.WorkTasks.EditWorkTask;
using Ordovita.Application.Tasks.WorkTasks.GetWorkspaceTasks;
using Ordovita.Domain.Tasks;

namespace Ordovita.Api.Endpoints.Tasks;

public static class WorkspaceTasksEndpoint
{
    public static RouteGroupBuilder MapWorkspaceTasksEndpoints(this IEndpointRouteBuilder root)
    {
        var g = root.MapGroup("/workspace/{workspaceId:guid}")
            .WithTags("Workspace Tasks")
            .RequireAuthorization();

        g.MapPost("/task", CreateTask).WithName("CreateWorkTask");
        g.MapPut("/task", EditTask).WithName("EditWorkTask");
        g.MapPut("/task/{taskId:guid}/assignees", SetTaskAssignees).WithName("SetTaskAssignees");
        g.MapDelete("/task/{taskId:guid}", DeleteTask).WithName("DeleteWorkTask");
        g.MapGet("/task", GetTasks).WithName("GetWorkspaceTasks");

        g.MapPost("/event", CreateEvent).WithName("CreateCalendarEvent");
        g.MapPut("/event", EditEvent).WithName("EditCalendarEvent");
        g.MapDelete("/event/{eventId:guid}", DeleteEvent).WithName("DeleteCalendarEvent");
        g.MapGet("/event", GetEvents).WithName("GetWorkspaceEvents");

        g.MapPost("/category", CreateCategory).WithName("CreateTaskCategory");
        g.MapPut("/category", EditCategory).WithName("EditTaskCategory");
        g.MapDelete("/category/{categoryId:guid}", DeleteCategory).WithName("DeleteTaskCategory");
        g.MapGet("/category", GetCategories).WithName("GetWorkspaceCategories");

        g.MapPost("/task-status", CreateTaskStatus).WithName("CreateWorkTaskStatus");
        g.MapPut("/task-status", EditTaskStatus).WithName("EditWorkTaskStatus");
        g.MapDelete("/task-status/{statusId:guid}", DeleteTaskStatus).WithName("DeleteWorkTaskStatus");
        g.MapGet("/task-status", GetTaskStatuses).WithName("GetWorkspaceTaskStatuses");

        return g;
    }

    private static async Task<IResult> CreateTask(
        Guid workspaceId, CreateTaskRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new CreateWorkTaskCommand(
            workspaceId, request.Title, request.Description, request.Priority,
            request.CategoryId, request.EstimatedDuration, request.DueDateTime,
            request.StatusId, request.Source), ct);
        return result.IsSuccess
            ? Results.Created($"/api/v1/workspace/{workspaceId}/task/{result.Value!.TaskId}", result.Value)
            : result.Error.ToProblem();
    }

    private static async Task<IResult> EditTask(
        Guid workspaceId, EditTaskRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new EditWorkTaskCommand(
            workspaceId, request.TaskId, request.Title, request.Description, request.Priority,
            request.CategoryId, request.EstimatedDuration, request.DueDateTime, request.StatusId), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> SetTaskAssignees(
        Guid workspaceId, Guid taskId, SetTaskAssigneesRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new SetTaskAssigneesCommand(
            workspaceId, taskId, request.UserIds ?? []), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> DeleteTask(
        Guid workspaceId, Guid taskId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new DeleteWorkTaskCommand(workspaceId, taskId), ct);
        return result.IsSuccess ? Results.NoContent() : result.Error.ToProblem();
    }

    private static async Task<IResult> GetTasks(Guid workspaceId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetWorkspaceTasksQuery(workspaceId), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> CreateEvent(
        Guid workspaceId, CreateEventRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new CreateCalendarEventCommand(
            workspaceId, request.TaskId, request.Title, request.StartDateTime,
            request.EndDateTime, request.AllDay, request.ProposedBy), ct);
        return result.IsSuccess
            ? Results.Created($"/api/v1/workspace/{workspaceId}/event/{result.Value!.EventId}", result.Value)
            : result.Error.ToProblem();
    }

    private static async Task<IResult> EditEvent(
        Guid workspaceId, EditEventRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new EditCalendarEventCommand(
            workspaceId, request.EventId, request.Title, request.StartDateTime,
            request.EndDateTime, request.AllDay, request.Status, request.Color), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> DeleteEvent(
        Guid workspaceId, Guid eventId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new DeleteCalendarEventCommand(workspaceId, eventId), ct);
        return result.IsSuccess ? Results.NoContent() : result.Error.ToProblem();
    }

    private static async Task<IResult> GetEvents(Guid workspaceId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetWorkspaceEventsQuery(workspaceId), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> CreateCategory(
        Guid workspaceId, CategoryRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new CreateTaskCategoryCommand(workspaceId, request.Name, request.Color), ct);
        return result.IsSuccess
            ? Results.Created($"/api/v1/workspace/{workspaceId}/category/{result.Value!.CategoryId}", result.Value)
            : result.Error.ToProblem();
    }

    private static async Task<IResult> EditCategory(
        Guid workspaceId, EditCategoryRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new EditTaskCategoryCommand(
            workspaceId, request.CategoryId, request.Name, request.Color), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> DeleteCategory(
        Guid workspaceId, Guid categoryId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new DeleteTaskCategoryCommand(workspaceId, categoryId), ct);
        return result.IsSuccess ? Results.NoContent() : result.Error.ToProblem();
    }

    private static async Task<IResult> GetCategories(Guid workspaceId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetWorkspaceCategoriesQuery(workspaceId), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> CreateTaskStatus(
        Guid workspaceId, CategoryRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new CreateWorkTaskStatusCommand(workspaceId, request.Name, request.Color), ct);
        return result.IsSuccess
            ? Results.Created($"/api/v1/workspace/{workspaceId}/task-status/{result.Value!.StatusId}", result.Value)
            : result.Error.ToProblem();
    }

    private static async Task<IResult> EditTaskStatus(
        Guid workspaceId, EditTaskStatusRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new EditWorkTaskStatusCommand(
            workspaceId, request.StatusId, request.Name, request.Color), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> DeleteTaskStatus(
        Guid workspaceId, Guid statusId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new DeleteWorkTaskStatusCommand(workspaceId, statusId), ct);
        return result.IsSuccess ? Results.NoContent() : result.Error.ToProblem();
    }

    private static async Task<IResult> GetTaskStatuses(Guid workspaceId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetWorkspaceTaskStatusesQuery(workspaceId), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private sealed record CreateTaskRequest(
        string Title,
        string? Description,
        TaskPriority Priority,
        Guid? CategoryId,
        int EstimatedDuration,
        DateTime? DueDateTime,
        Guid StatusId,
        TaskSource Source);

    private sealed record EditTaskRequest(
        Guid TaskId,
        string Title,
        string? Description,
        TaskPriority Priority,
        Guid? CategoryId,
        int EstimatedDuration,
        DateTime? DueDateTime,
        Guid StatusId);

    private sealed record SetTaskAssigneesRequest(IReadOnlyList<Guid>? UserIds);

    private sealed record CreateEventRequest(
        Guid? TaskId,
        string Title,
        DateTime StartDateTime,
        DateTime EndDateTime,
        bool AllDay,
        ProposedBy ProposedBy);

    private sealed record EditEventRequest(
        Guid EventId,
        string Title,
        DateTime StartDateTime,
        DateTime EndDateTime,
        bool AllDay,
        EventStatus Status,
        string Color);

    private sealed record CategoryRequest(string Name, string Color);

    private sealed record EditCategoryRequest(Guid CategoryId, string Name, string Color);

    private sealed record EditTaskStatusRequest(Guid StatusId, string Name, string Color);
}