using Ordovita.Domain.Common;

namespace Ordovita.Domain.Surveys.Questions;

public readonly record struct QuestionId(Guid Value) : IEntityId<QuestionId>
{
    public static QuestionId New()
    {
        return new QuestionId(Guid.CreateVersion7());
    }

    public static QuestionId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("QuestionId cannot be empty.", nameof(value));
        return new QuestionId(value);
    }

    public override string ToString()
    {
        return Value.ToString();
    }
}