namespace Ordovita.Application.Surveys;

public sealed record QuestionDto(
    Guid QuestionId,
    Guid SurveyId,
    string QuestionText,
    bool IsRequired,
    string Hint,
    DateTime CreatedAt);
