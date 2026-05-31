using Ordovita.Domain.Common;

namespace Ordovita.Domain.Surveys.Surveys;

public readonly record struct SurveyId(Guid Value) : IEntityId<SurveyId>
{
    public static SurveyId New()
    {
        return new SurveyId(Guid.CreateVersion7());
    }

    public static SurveyId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("SurveyId cannot be empty.", nameof(value));
        return new SurveyId(value);
    }

    public override string ToString()
    {
        return Value.ToString();
    }
}