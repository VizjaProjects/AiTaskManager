namespace Ordovita.Domain.Common;

public enum ErrorType
{
    None,
    Failure,
    Validation,
    NotFound,
    Conflict,
    Unauthorized
}

public sealed record Error(string Code, string Description, ErrorType Type = ErrorType.Failure)
{
    public static readonly Error None = new(string.Empty, string.Empty, ErrorType.None);

    public static Error NotFound(string code, string description)
    {
        return new Error(code, description, ErrorType.NotFound);
    }

    public static Error Validation(string code, string description)
    {
        return new Error(code, description, ErrorType.Validation);
    }

    public static Error Conflict(string code, string description)
    {
        return new Error(code, description, ErrorType.Conflict);
    }

    public static Error Unauthorized(string code, string description)
    {
        return new Error(code, description, ErrorType.Unauthorized);
    }

    public static Error AspIdentity(string code, string description)
    {
        return new Error(code, description, ErrorType.Unauthorized);
    }
}