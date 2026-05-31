using Ordovita.Domain.Common;

namespace Ordovita.Domain.Surveys.Exception;

public class UserResponseException
{
    public static readonly Error MissingUserId =
        Error.Validation("UserResponse.MissingUserId", "User id is required.");

    public static readonly Error MissingQuestionId =
        Error.Validation("UserResponse.QuestionId", "Question id is required.");

    public static readonly Error MissingTextAnswer =
        Error.Validation("UserResponse.TextAnswer", "Text answer is required.");

    public static readonly Error SameTextAnswer =
        Error.Validation("UserResponse.SameTextAnswer", "TextAnswer cannot be the same as new TextAnswer");

    public static readonly Error NotFound =
        Error.NotFound("UserResponse.NotFound", "User response was not found.");

    public static readonly Error AlreadyAnswered =
        Error.Conflict("UserResponse.AlreadyAnswered", "User has already answered this question.");
}