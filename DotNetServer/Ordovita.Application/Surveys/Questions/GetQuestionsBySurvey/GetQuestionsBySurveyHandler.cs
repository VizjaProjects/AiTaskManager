using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Surveys;
using Ordovita.Domain.Common;
using Ordovita.Domain.Surveys.Exception;
using Ordovita.Domain.Surveys.port;
using Ordovita.Domain.Surveys.Surveys;

namespace Ordovita.Application.Surveys.Questions.GetQuestionsBySurvey;

public sealed class GetQuestionsBySurveyHandler(
    ISurveyRepository surveyRepository,
    IQuestionRepository questionRepository)
    : IQueryHandler<GetQuestionsBySurveyQuery, IReadOnlyList<QuestionDto>>
{
    public async Task<Result<IReadOnlyList<QuestionDto>>> Handle(GetQuestionsBySurveyQuery query, CancellationToken ct)
    {
        var surveyId = SurveyId.From(query.SurveyId);
        if (await surveyRepository.GetByIdAsync(surveyId, ct) is null)
            return Result.Failure<IReadOnlyList<QuestionDto>>(SurveyException.NotFound);

        var questions = await questionRepository.GetAllBySurveyIdAsync(surveyId, ct);
        var result = questions.Select(q => new QuestionDto(
            q.Id.Value, q.SurveyId.Value, q.QuestionText, q.IsRequired, q.Hint, q.CreatedAt)).ToList();

        return Result.Success<IReadOnlyList<QuestionDto>>(result);
    }
}