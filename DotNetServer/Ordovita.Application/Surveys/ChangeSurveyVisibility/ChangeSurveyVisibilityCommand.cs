using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Surveys;

namespace Ordovita.Application.Surveys.ChangeSurveyVisibility;

public sealed record ChangeSurveyVisibilityCommand(Guid SurveyId, bool IsVisible)
    : ICommand<SurveySummaryDto>;
