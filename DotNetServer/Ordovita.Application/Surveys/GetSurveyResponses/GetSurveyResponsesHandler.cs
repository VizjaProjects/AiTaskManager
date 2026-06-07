using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Surveys.GetUserAnswers;
using Ordovita.Domain.Common;
using Ordovita.Domain.Surveys.Exception;
using Ordovita.Domain.Surveys.port;
using Ordovita.Domain.Surveys.Surveys;

namespace Ordovita.Application.Surveys.GetSurveyResponses;

public sealed class GetSurveyResponsesHandler(
    ISurveyRepository surveyRepository,
    IUserAnswerReader reader)
    : IQueryHandler<GetSurveyResponsesQuery, IReadOnlyList<SurveyWithAnswersDto>>
{
    public async Task<Result<IReadOnlyList<SurveyWithAnswersDto>>> Handle(
        GetSurveyResponsesQuery query, CancellationToken ct)
    {
        var surveyId = SurveyId.From(query.SurveyId);
        if (await surveyRepository.GetByIdAsync(surveyId, ct) is null)
            return Result.Failure<IReadOnlyList<SurveyWithAnswersDto>>(SurveyException.NotFound);

        var responses = await reader.GetBySurveyIdAsync(surveyId, ct);
        return Result.Success(responses);
    }
}