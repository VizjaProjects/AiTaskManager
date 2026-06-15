using Ordovita.Api.Common;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Workspaces;
using Ordovita.Application.Workspaces.AssignUsersByEmail;
using Ordovita.Application.Workspaces.AssignUsersToWorkspace;
using Ordovita.Application.Workspaces.ChangeWorkspaceVisibility;
using Ordovita.Application.Workspaces.CreateWorkspace;
using Ordovita.Application.Workspaces.DeleteWorkspace;
using Ordovita.Application.Workspaces.GetMyWorkspaces;
using Ordovita.Application.Workspaces.GetWorkspaceById;
using Ordovita.Application.Workspaces.RemoveUsersFromWorkspace;
using Ordovita.Domain.Workspace;

namespace Ordovita.Api.Endpoints.Workspaces;

public static class WorkspaceEndpoint
{
    public static RouteGroupBuilder MapWorkspaceEndpoints(this IEndpointRouteBuilder root)
    {
        var g = root.MapGroup("/workspace").WithTags("Workspaces").RequireAuthorization();

        g.MapPost("/create", CreateWorkspace)
            .WithName("CreateWorkspace")
            .Produces<WorkspaceDto>(201)
            .Produces(400)
            .Produces(401);

        g.MapGet("/all", GetMyWorkspaces)
            .WithName("GetMyWorkspaces")
            .Produces<IReadOnlyList<WorkspaceDto>>(200)
            .Produces(401);

        g.MapGet("/{workspaceId:guid}", GetWorkspaceById)
            .WithName("GetWorkspaceById")
            .Produces<WorkspaceDto>(200)
            .Produces(401)
            .Produces(404);

        g.MapPost("/{workspaceId:guid}/assignUsers", AssignUsers)
            .WithName("AssignUsersToWorkspace")
            .Produces<WorkspaceDto>(200)
            .Produces(401)
            .Produces(404);

        g.MapPost("/{workspaceId:guid}/assignUsersByEmail", AssignUsersByEmail)
            .WithName("AssignUsersToWorkspaceByEmail")
            .Produces<AssignUsersByEmailResult>(200)
            .Produces(400)
            .Produces(401)
            .Produces(404);

        g.MapPatch("/{workspaceId:guid}/removeUsers", RemoveUsers)
            .WithName("RemoveUsersFromWorkspace")
            .Produces<WorkspaceDto>(200)
            .Produces(401)
            .Produces(404);

        g.MapPut("/{workspaceId:guid}/visibility", ChangeVisibility)
            .WithName("ChangeWorkspaceVisibility")
            .Produces<WorkspaceDto>(200)
            .Produces(400)
            .Produces(401)
            .Produces(404);

        g.MapDelete("/delete/{workspaceId:guid}", DeleteWorkspace)
            .WithName("DeleteWorkspace")
            .Produces(204)
            .Produces(401)
            .Produces(404);

        return g;
    }

    private static async Task<IResult> CreateWorkspace(CreateWorkspaceRequest request, ISender sender,
        CancellationToken ct)
    {
        var visibility = ParseVisibility(request.Visibility);
        var result = await sender.Send(
            new CreateWorkspaceCommand(request.WorkspaceName, request.AssignedUserIds, visibility), ct);
        return result.IsSuccess
            ? Results.Created($"/api/v1/workspace/{result.Value!.WorkspaceId}", result.Value)
            : result.Error.ToProblem();
    }

    private static async Task<IResult> GetMyWorkspaces(ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetMyWorkspacesQuery(), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> GetWorkspaceById(Guid workspaceId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetWorkspaceByIdQuery(workspaceId), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> AssignUsers(
        Guid workspaceId, WorkspaceUsersRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new AssignUsersToWorkspaceCommand(workspaceId, request.UserIds), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> AssignUsersByEmail(
        Guid workspaceId, WorkspaceEmailsRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new AssignUsersByEmailCommand(workspaceId, request.Emails), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> RemoveUsers(
        Guid workspaceId, WorkspaceUsersRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new RemoveUsersFromWorkspaceCommand(workspaceId, request.UserIds), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> DeleteWorkspace(Guid workspaceId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new DeleteWorkspaceCommand(workspaceId), ct);
        return result.IsSuccess ? Results.NoContent() : result.Error.ToProblem();
    }

    private static async Task<IResult> ChangeVisibility(
        Guid workspaceId, ChangeVisibilityRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(
            new ChangeWorkspaceVisibilityCommand(workspaceId, ParseVisibility(request.Visibility)), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static WorkspaceVisibility ParseVisibility(string? value)
    {
        return Enum.TryParse<WorkspaceVisibility>(value, ignoreCase: true, out var parsed)
            ? parsed
            : WorkspaceVisibility.Private;
    }

    private sealed record CreateWorkspaceRequest(
        string WorkspaceName,
        IReadOnlyList<Guid>? AssignedUserIds,
        string? Visibility);

    private sealed record ChangeVisibilityRequest(string Visibility);

    private sealed record WorkspaceUsersRequest(IReadOnlyList<Guid> UserIds);

    private sealed record WorkspaceEmailsRequest(IReadOnlyList<string> Emails);
}