using Ordovita.Api.Common;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Surveys.GetSurveyResponses;
using Ordovita.Application.Surveys.GetUserAnswers;
using Ordovita.Application.Surveys.UserResponses.AddUserResponse;
using Ordovita.Application.Surveys.UserResponses.ChangeUserResponse;
using Ordovita.Application.Surveys.UserResponses.DeleteUserResponse;

namespace Ordovita.Api.Endpoints.Surveys;

public static class UserResponseEndpoint
{
    public static RouteGroupBuilder MapUserResponseEndpoints(this IEndpointRouteBuilder root)
    {
        var g = root.MapGroup("/user-response").WithTags("UserResponses").RequireAuthorization();

        g.MapPost("/{surveyId:guid}", AddUserResponse)
            .WithName("AddUserResponse")
            .Produces<AddUserResponseResult>(201)
            .Produces(400)
            .Produces(401)
            .Produces(404)
            .Produces(409);

        g.MapPut("/change/{userResponseId:guid}", ChangeUserResponse)
            .WithName("ChangeUserResponse")
            .Produces<ChangeUserResponseResult>(200)
            .Produces(401)
            .Produces(404);

        g.MapDelete("/delete/{userResponseId:guid}", DeleteUserResponse)
            .WithName("DeleteUserResponse")
            .Produces(204)
            .Produces(401)
            .Produces(404);

        g.MapGet("/getAllUserResponse", GetAllUserResponses)
            .WithName("GetAllUserResponses")
            .Produces<GetAllUserResponsesResponse>(200)
            .Produces(401);

        g.MapGet("/survey/{surveyId:guid}", GetSurveyResponses)
            .WithName("GetSurveyResponses")
            .RequireAuthorization(policy => policy.RequireRole("ADMIN"))
            .Produces<GetAllUserResponsesResponse>(200)
            .Produces(404);

        return g;
    }

    private static async Task<IResult> GetSurveyResponses(
        Guid surveyId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetSurveyResponsesQuery(surveyId), ct);
        return result.IsSuccess
            ? Results.Ok(new GetAllUserResponsesResponse(result.Value!))
            : result.Error.ToProblem();
    }

    private static async Task<IResult> AddUserResponse(
        Guid surveyId, UserResponseRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new AddUserResponseCommand(surveyId, request.QuestionId, request.Answer), ct);
        return result.IsSuccess
            ? Results.Created($"/api/v1/user-response/{result.Value!.QuestionId}", result.Value)
            : result.Error.ToProblem();
    }

    private static async Task<IResult> ChangeUserResponse(
        Guid userResponseId, ChangeUserResponseRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new ChangeUserResponseCommand(userResponseId, request.NewAnswer), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> DeleteUserResponse(Guid userResponseId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new DeleteUserResponseCommand(userResponseId), ct);
        return result.IsSuccess ? Results.NoContent() : result.Error.ToProblem();
    }

    private static async Task<IResult> GetAllUserResponses(ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetUserAnswersQuery(), ct);
        return result.IsSuccess
            ? Results.Ok(new GetAllUserResponsesResponse(result.Value!))
            : result.Error.ToProblem();
    }

    private sealed record UserResponseRequest(Guid QuestionId, string Answer);

    private sealed record ChangeUserResponseRequest(string NewAnswer);

    private sealed record GetAllUserResponsesResponse(IReadOnlyList<SurveyWithAnswersDto> UserResponseResultSet);
}