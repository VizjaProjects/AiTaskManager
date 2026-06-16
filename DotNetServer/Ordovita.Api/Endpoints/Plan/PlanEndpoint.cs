using Ordovita.Api.Common;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Plan;
using Ordovita.Application.Plan.CreatePlan;
using Ordovita.Domain.Identity;

namespace Ordovita.Api.Endpoints.Plan;

public static class PlanEndpoint
{
    public static RouteGroupBuilder MapPlanEndpoints(this RouteGroupBuilder root) {
        var g = root.MapGroup("/plan").WithTags("Plan").RequireAuthorization(e => e.RequireRole(nameof(Role.ADMIN)));

        g.MapPost("/", CreatePlan)
            .WithName("CreatePlan")
            .Produces<PlanDto>(201)
            .Produces(400)
            .Produces(404);

        return g;
    }
    
    private static async Task<IResult> CreatePlan(
        PlanRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new CreatePlanCommand(
            request.PlanName,request.AiTaskLimit,request.PublicWorkspaceLimit,request.PrivateWorkspaceLimit), ct);

        return result.IsSuccess
            ? Results.Created($"/api/v1/plan/{result.Value!.PlanId}", result.Value)
            : result.Error.ToProblem();
    }
    
    private sealed record PlanRequest(
        string PlanName, int AiTaskLimit, int PublicWorkspaceLimit,
        int PrivateWorkspaceLimit);
}