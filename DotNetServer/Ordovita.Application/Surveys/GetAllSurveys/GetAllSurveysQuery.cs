using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Surveys;

namespace Ordovita.Application.Surveys.GetAllSurveys;

public sealed record GetAllSurveysQuery : IQuery<IReadOnlyList<SurveySummaryDto>>;
