namespace Ordovita.Domain.Surveys.UserResponse;

public record TextAnswer(string Value)
{
    public static TextAnswer New(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Value cannot be null or whitespace.", nameof(value));
        return new TextAnswer(value);
    }

    public static TextAnswer From(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("TextAnswer cannot be empty.", nameof(value));
        if (value.Length < 2)
            throw new ArgumentException("TextAnswer must be at least 2 characters.", nameof(value));
        if (value.Length > 100)
            throw new ArgumentException("TextAnswer must be at most 100 characters.", nameof(value));
        return new TextAnswer(value);
    }
}