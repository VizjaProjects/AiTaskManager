using Ordovita.Api.Common;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Tasks.Ai.GenerateAiPlan;

namespace Ordovita.Api.Endpoints.Tasks;

public static class WorkspaceAiPlanEndpoint
{
    public static RouteGroupBuilder MapWorkspaceAiPlanEndpoints(this IEndpointRouteBuilder root)
    {
        var g = root.MapGroup("/workspace/{workspaceId:guid}/ai")
            .WithTags("Workspace AI Planning")
            .RequireAuthorization();

        g.MapPost("/plan", GeneratePlan).WithName("GenerateAiPlan");

        return g;
    }

    private static async Task<IResult> GeneratePlan(
        Guid workspaceId, GenerateAiPlanRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(
            new GenerateAiPlanCommand(workspaceId, request.UserText, request.TimeZoneId), ct);

        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private sealed record GenerateAiPlanRequest(string UserText, string? TimeZoneId);
}
