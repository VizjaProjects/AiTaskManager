using Ordovita.Api.Common;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Surveys;
using Ordovita.Application.Surveys.ChangeSurveyVisibility;
using Ordovita.Application.Surveys.CreateSurvey;
using Ordovita.Application.Surveys.DeleteSurvey;
using Ordovita.Application.Surveys.EditSurvey;
using Ordovita.Application.Surveys.GetActiveSurveys;
using Ordovita.Application.Surveys.GetAllSurveys;

namespace Ordovita.Api.Endpoints.Surveys;

public static class SurveyEndpoint
{
    public static RouteGroupBuilder MapSurveyEndpoints(this IEndpointRouteBuilder root)
    {
        var g = root.MapGroup("/survey").WithTags("Surveys")
            .RequireAuthorization(policy => policy.RequireRole("ADMIN"));

        g.MapPost("/createSurvey", CreateSurvey)
            .WithName("CreateSurvey")
            .Produces<CreateSurveyResult>(201)
            .Produces(400);

        g.MapPatch("/changeVisible/{surveyId:guid}", ChangeVisible)
            .WithName("ChangeSurveyVisibility")
            .Produces<SurveySummaryDto>(200)
            .Produces(404);

        g.MapPut("/edit/{surveyId:guid}", EditSurvey)
            .WithName("EditSurvey")
            .Produces<SurveySummaryDto>(200)
            .Produces(404);

        g.MapGet("/all", GetAllSurveys)
            .WithName("GetAllSurveys")
            .Produces<IReadOnlyList<SurveySummaryDto>>(200);

        g.MapGet("/allAcrive", GetActiveSurveys)
            .WithName("GetActiveSurveys")
            .Produces<IReadOnlyList<SurveySummaryDto>>(200);

        g.MapDelete("/delete/{surveyId:guid}", DeleteSurvey)
            .WithName("DeleteSurvey")
            .Produces(204)
            .Produces(404);

        return g;
    }

    private static async Task<IResult> CreateSurvey(CreateSurveyRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new CreateSurveyCommand(request.Title, request.Description), ct);
        return result.IsSuccess
            ? Results.Created($"/api/v1/survey/{result.Value!.SurveyId}", result.Value)
            : result.Error.ToProblem();
    }

    private static async Task<IResult> ChangeVisible(
        Guid surveyId, ChangeSurveyVisibleRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new ChangeSurveyVisibilityCommand(surveyId, request.IsVisible), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> EditSurvey(
        Guid surveyId, EditSurveyRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new EditSurveyCommand(surveyId, request.Title, request.Description), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> GetAllSurveys(ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetAllSurveysQuery(), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> GetActiveSurveys(ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetActiveSurveysQuery(), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> DeleteSurvey(Guid surveyId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new DeleteSurveyCommand(surveyId), ct);
        return result.IsSuccess ? Results.NoContent() : result.Error.ToProblem();
    }

    private sealed record CreateSurveyRequest(string Title, string Description);

    private sealed record ChangeSurveyVisibleRequest(bool IsVisible);

    private sealed record EditSurveyRequest(string Title, string Description);
}