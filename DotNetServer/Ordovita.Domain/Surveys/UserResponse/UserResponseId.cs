using Ordovita.Domain.Common;

namespace Ordovita.Domain.Surveys.UserResponse;

public readonly record struct UserResponseId(Guid Value) : IEntityId<UserResponseId>
{
    public static UserResponseId New()
    {
        return new UserResponseId(Guid.CreateVersion7());
    }

    public static UserResponseId From(Guid value)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("SurveyId cannot be empty.", nameof(value));
        return new UserResponseId(value);
    }

    public override string ToString()
    {
        return Value.ToString();
    }
}