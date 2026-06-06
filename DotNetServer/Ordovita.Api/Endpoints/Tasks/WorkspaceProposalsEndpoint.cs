using Ordovita.Api.Common;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Tasks;
using Ordovita.Application.Tasks.Proposals.AcceptAiEvent;
using Ordovita.Application.Tasks.Proposals.AcceptAiTask;
using Ordovita.Application.Tasks.Proposals.GetPendingProposals;
using Ordovita.Application.Tasks.Proposals.RejectAiEvent;
using Ordovita.Application.Tasks.Proposals.RejectAiTask;
using Ordovita.Domain.Tasks;

namespace Ordovita.Api.Endpoints.Tasks;

public static class WorkspaceProposalsEndpoint
{
    public static RouteGroupBuilder MapWorkspaceProposalsEndpoints(this IEndpointRouteBuilder root)
    {
        var g = root.MapGroup("/workspace/{workspaceId:guid}/proposals")
            .WithTags("Workspace AI Proposals")
            .RequireAuthorization();

        g.MapGet("/", GetPendingProposals).WithName("GetPendingProposals");
        g.MapPost("/tasks/{taskId:guid}/accept", AcceptTask).WithName("AcceptAiTask");
        g.MapDelete("/tasks/{taskId:guid}", RejectTask).WithName("RejectAiTask");
        g.MapPost("/events/{eventId:guid}/accept", AcceptEvent).WithName("AcceptAiEvent");
        g.MapDelete("/events/{eventId:guid}", RejectEvent).WithName("RejectAiEvent");

        return g;
    }

    private static async Task<IResult> GetPendingProposals(
        Guid workspaceId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetPendingProposalsQuery(workspaceId), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> AcceptTask(
        Guid workspaceId, Guid taskId, AcceptAiTaskRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new AcceptAiTaskCommand(
            workspaceId, taskId, request.Title, request.Description, request.Priority,
            request.CategoryId, request.EstimatedDuration, request.DueDateTime, request.StatusId), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> RejectTask(
        Guid workspaceId, Guid taskId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new RejectAiTaskCommand(workspaceId, taskId), ct);
        return result.IsSuccess ? Results.NoContent() : result.Error.ToProblem();
    }

    private static async Task<IResult> AcceptEvent(
        Guid workspaceId, Guid eventId, AcceptAiEventRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new AcceptAiEventCommand(
            workspaceId, eventId, request.Title, request.StartDateTime,
            request.EndDateTime, request.AllDay), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> RejectEvent(
        Guid workspaceId, Guid eventId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new RejectAiEventCommand(workspaceId, eventId), ct);
        return result.IsSuccess ? Results.NoContent() : result.Error.ToProblem();
    }

    private sealed record AcceptAiTaskRequest(
        string Title,
        string? Description,
        TaskPriority Priority,
        Guid? CategoryId,
        int EstimatedDuration,
        DateTime? DueDateTime,
        Guid StatusId);

    private sealed record AcceptAiEventRequest(
        string Title,
        DateTime StartDateTime,
        DateTime EndDateTime,
        bool AllDay);
}