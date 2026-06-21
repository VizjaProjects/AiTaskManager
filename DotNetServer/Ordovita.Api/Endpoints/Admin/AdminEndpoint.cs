using Ordovita.Api.Common;
using Ordovita.Application.Admin;
using Ordovita.Application.Admin.GetAllUsersForAdmin;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Plan;
using Ordovita.Application.Plan.CreatePlan;
using Ordovita.Application.Plan.GetAllPlans;
using Ordovita.Domain.Identity;

namespace Ordovita.Api.Endpoints.Admin;

public static class AdminEndpoint
{
    public static RouteGroupBuilder MapAdminEndpoints(this RouteGroupBuilder root)
    {
        var g = root.MapGroup("/admin")
            .WithTags("Admin")
            .RequireAuthorization(e => e.RequireRole(nameof(Role.ADMIN)));

        g.MapGet("/plans", GetPlans)
            .WithName("AdminGetPlans")
            .Produces<IReadOnlyList<PlanDto>>(200);

        g.MapPost("/plans", CreatePlan)
            .WithName("AdminCreatePlan")
            .Produces<PlanDto>(201)
            .Produces(400);

        g.MapGet("/users", GetUsers)
            .WithName("AdminGetUsers")
            .Produces<IReadOnlyList<AdminUserDto>>(200);

        return g;
    }

    private static async Task<IResult> GetPlans(ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetAllPlansQuery(), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> CreatePlan(
        CreatePlanRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new CreatePlanCommand(
            request.PlanName,
            request.AiTaskLimit,
            request.PublicWorkspaceLimit,
            request.PrivateWorkspaceLimit,
            request.IsActive), ct);

        return result.IsSuccess
            ? Results.Created($"/api/v1/admin/plans/{result.Value!.PlanId}", result.Value)
            : result.Error.ToProblem();
    }

    private static async Task<IResult> GetUsers(ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetAllUsersForAdminQuery(), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private sealed record CreatePlanRequest(
        string PlanName,
        int AiTaskLimit,
        int PublicWorkspaceLimit,
        int PrivateWorkspaceLimit,
        bool IsActive);
}
