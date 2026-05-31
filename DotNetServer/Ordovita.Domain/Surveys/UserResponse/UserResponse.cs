using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Surveys.Exception;
using Ordovita.Domain.Surveys.Questions;

namespace Ordovita.Domain.Surveys.UserResponse;

public class UserResponse : AggregateRoot<UserResponseId>
{
    public UserId UserId { get; private set; }
    public QuestionId QuestionId { get; private set; }
    public TextAnswer TextAnswer { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    private UserResponse()
    {
    }

    public static Result<UserResponse> Create(UserId userId, QuestionId questionId, TextAnswer textAnswer)
    {
        if (userId.Value == Guid.Empty) return Result.Failure<UserResponse>(UserResponseException.MissingUserId);
        if (questionId.Value == Guid.Empty)
            return Result.Failure<UserResponse>(UserResponseException.MissingQuestionId);
        if (string.IsNullOrWhiteSpace(textAnswer.ToString()))
            return Result.Failure<UserResponse>(UserResponseException.MissingTextAnswer);

        var userResponse = new UserResponse
        {
            Id = UserResponseId.New(),
            UserId = userId,
            QuestionId = questionId,
            TextAnswer = textAnswer,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        return Result.Success(userResponse);
    }

    public Result ChangeResponse(TextAnswer textAnswer)
    {
        if (TextAnswer == textAnswer) return Result.Failure(UserResponseException.SameTextAnswer);
        if (string.IsNullOrWhiteSpace(textAnswer.ToString()))
            return Result.Failure(UserResponseException.MissingTextAnswer);

        TextAnswer = textAnswer;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }
}