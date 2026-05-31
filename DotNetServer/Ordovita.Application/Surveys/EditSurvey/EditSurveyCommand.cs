using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Surveys;

namespace Ordovita.Application.Surveys.EditSurvey;

public sealed record EditSurveyCommand(Guid SurveyId, string Title, string Description)
    : ICommand<SurveySummaryDto>;