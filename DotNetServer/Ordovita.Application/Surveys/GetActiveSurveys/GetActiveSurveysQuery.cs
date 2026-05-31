using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Surveys;

namespace Ordovita.Application.Surveys.GetActiveSurveys;

public sealed record GetActiveSurveysQuery : IQuery<IReadOnlyList<SurveySummaryDto>>;
