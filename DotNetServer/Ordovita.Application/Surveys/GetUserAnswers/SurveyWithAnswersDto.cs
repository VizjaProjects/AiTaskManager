namespace Ordovita.Application.Surveys.GetUserAnswers;

public record SurveyWithAnswersDto(
    Guid SurveyId,
    string SurveyDescription,
    Guid QuestionId,
    string QuestionText,
    Guid UserResponseId,
    string TextAnswer);