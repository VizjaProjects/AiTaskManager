using Ordovita.Api.Common;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Surveys;
using Ordovita.Application.Surveys.Questions.CreateQuestion;
using Ordovita.Application.Surveys.Questions.DeleteQuestion;
using Ordovita.Application.Surveys.Questions.EditQuestion;
using Ordovita.Application.Surveys.Questions.GetQuestionsBySurvey;

namespace Ordovita.Api.Endpoints.Surveys;

public static class QuestionEndpoint
{
    public static RouteGroupBuilder MapQuestionEndpoints(this IEndpointRouteBuilder root)
    {
        var g = root.MapGroup("/question").WithTags("Questions");

        g.MapPost("/{surveyId:guid}", CreateQuestion)
            .WithName("CreateQuestion")
            .Produces<CreateQuestionResult>(201)
            .Produces(400)
            .Produces(404);

        g.MapGet("/allSurveyQuestion/{surveyId:guid}", GetQuestionsBySurvey)
            .WithName("GetQuestionsBySurvey")
            .Produces<IReadOnlyList<QuestionDto>>(200)
            .Produces(404);

        g.MapPut("/edit/{questionId:guid}", EditQuestion)
            .WithName("EditQuestion")
            .Produces<EditQuestionResult>(200)
            .Produces(404);

        g.MapPatch("/deleteQuestion/{questionId:guid}", DeleteQuestion)
            .WithName("DeleteQuestion")
            .Produces<DeleteQuestionResult>(200)
            .Produces(404);

        return g;
    }

    private static async Task<IResult> CreateQuestion(
        Guid surveyId, QuestionRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new CreateQuestionCommand(
            surveyId, request.QuestionText, request.IsRequired, request.Hint), ct);

        return result.IsSuccess
            ? Results.Created($"/api/v1/question/{result.Value!.QuestionId}", result.Value)
            : result.Error.ToProblem();
    }

    private static async Task<IResult> GetQuestionsBySurvey(Guid surveyId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetQuestionsBySurveyQuery(surveyId), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> EditQuestion(
        Guid questionId, EditQuestionRequest request, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new EditQuestionCommand(
            questionId, request.QuestionText, request.IsRequired, request.Hint), ct);

        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> DeleteQuestion(Guid questionId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new DeleteQuestionCommand(questionId), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private sealed record QuestionRequest(string QuestionText, bool IsRequired, string Hint);
    private sealed record EditQuestionRequest(string QuestionText, bool IsRequired, string Hint);
}
