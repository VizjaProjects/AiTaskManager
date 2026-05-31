namespace Ordovita.Application.Surveys.CreateSurvey;

public sealed record CreateSurveyResult(Guid SurveyId, string Title, string Description, DateTime CreatedAt, bool IsVisible);
