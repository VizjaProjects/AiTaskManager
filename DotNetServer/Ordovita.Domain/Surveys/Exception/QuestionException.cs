using Ordovita.Domain.Common;

namespace Ordovita.Domain.Surveys.Exception;

public class QuestionException
{
    public static readonly Error MissingQuestionText =
        Error.Validation("Question.MissingQuestionText", "Question text is required.");

    public static readonly Error MissingQuestionType =
        Error.Validation("Question.MissingQuestionType", "Question type is required.");

    public static readonly Error MissingSurveyId =
        Error.Validation("Question.MissingSurveyId", "Survey id is required.");

    public static readonly Error NotFound =
        Error.NotFound("Question.NotFound", "Question was not found.");
}