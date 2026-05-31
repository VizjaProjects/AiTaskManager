namespace Ordovita.Application.Surveys;

public sealed record SurveySummaryDto(
    Guid SurveyId,
    string Title,
    string Description,
    bool IsVisible,
    DateTime CreatedAt,
    DateTime UpdatedAt);
