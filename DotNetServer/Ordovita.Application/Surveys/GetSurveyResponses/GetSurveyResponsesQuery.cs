using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Surveys.GetUserAnswers;

namespace Ordovita.Application.Surveys.GetSurveyResponses;

public sealed record GetSurveyResponsesQuery(Guid SurveyId)
    : IQuery<IReadOnlyList<SurveyWithAnswersDto>>;