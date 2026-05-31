using Ordovita.Domain.Common;
using Ordovita.Domain.Surveys.Exception;
using Ordovita.Domain.Surveys.Surveys;

namespace Ordovita.Domain.Surveys.Questions;

public class Question : Entity<QuestionId>
{
    public SurveyId SurveyId { get; private set; }
    public string QuestionText { get; private set; }
    public bool IsRequired { get; private set; }
    public string Hint { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private Question()
    {
    }

    public static Result<Question> Create(string questionText, SurveyId surveyId,
        bool isRequired, string hint)
    {
        if (string.IsNullOrWhiteSpace(questionText))
            return Result.Failure<Question>(QuestionException.MissingQuestionText);
        if (surveyId.Value == Guid.Empty)
            return Result.Failure<Question>(QuestionException.MissingSurveyId);

        var question = new Question
        {
            Id = QuestionId.New(),
            SurveyId = surveyId,
            QuestionText = questionText,
            IsRequired = isRequired,
            Hint = hint,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        return Result.Success(question);
    }

    public Result<Question> Edit(string questionText, bool isRequired, string hint)
    {
        if (string.IsNullOrWhiteSpace(questionText))
            return Result.Failure<Question>(QuestionException.MissingQuestionText);

        QuestionText = questionText;
        IsRequired = isRequired;
        Hint = hint;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success(this);
    }
}