using Ordovita.Api.Common;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Plan;
using Ordovita.Application.Plan.GetUserPlanLimits;

namespace Ordovita.Api.Endpoints.Plan;

public static class PlanEndpoint
{
    public static RouteGroupBuilder MapPlanEndpoints(this RouteGroupBuilder root)
    {
        var g = root.MapGroup("/plan").WithTags("Plan").RequireAuthorization();

        g.MapGet("/userPlan", GetUserPlan)
            .WithName("GetUserPlan")
            .Produces<UserPlanUsageDto>(200)
            .Produces(400)
            .Produces(404);

        return g;
    }

    private static async Task<IResult> GetUserPlan(
        ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetUserPlanLimitsQuery(), ct);

        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }
}