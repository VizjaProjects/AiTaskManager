using Ordovita.Domain.Common;
using Ordovita.Domain.Surveys.Exception;

namespace Ordovita.Domain.Surveys.Surveys;

public class Survey : AggregateRoot<SurveyId>
{
    public string Title { get; private set; }
    public string Description { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }
    public bool IsVisible { get; private set; }

    private Survey()
    {
    }

    public static Result<Survey> Create(string title, string description)
    {
        if (string.IsNullOrWhiteSpace(title)) return Result.Failure<Survey>(SurveyException.MissingTitle);
        if (string.IsNullOrWhiteSpace(description)) return Result.Failure<Survey>(SurveyException.MissingDescription);

        var survey = new Survey
        {
            Id = SurveyId.New(),
            Title = title,
            Description = description,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsVisible = false
        };

        return Result.Success(survey);
    }

    public Result ChangeVisibility(bool isVisible)
    {
        if (IsVisible == isVisible && !IsVisible) return Result.Failure(SurveyException.AlreadyNotVisable);
        if (IsVisible == isVisible && IsVisible) return Result.Failure(SurveyException.AlreadyVisable);
        IsVisible = isVisible;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result<Survey> EditSurvey(string title, string description)
    {
        if (string.IsNullOrWhiteSpace(title)) return Result.Failure<Survey>(SurveyException.MissingTitle);
        if (string.IsNullOrWhiteSpace(description)) return Result.Failure<Survey>(SurveyException.MissingDescription);

        Title = title;
        Description = description;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success(this);
    }
}