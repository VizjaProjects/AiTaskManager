using Ordovita.Domain.Identity;
using Ordovita.Domain.Surveys.Questions;
using UserResponseAggregate = Ordovita.Domain.Surveys.UserResponse.UserResponse;
using UserResponseId = Ordovita.Domain.Surveys.UserResponse.UserResponseId;

namespace Ordovita.Domain.Surveys.port;

public interface IUserResponseRepository
{
    Task AddAsync(UserResponseAggregate userResponse, CancellationToken ct = default);
    Task<UserResponseAggregate?> GetByIdAsync(UserResponseId userResponseId, CancellationToken ct = default);
    Task<IReadOnlyList<UserResponseAggregate>> GetAllByUserIdAsync(UserId userId, CancellationToken ct = default);

    Task<UserResponseAggregate?> GetByUserAndResponseIdAsync(UserId userId, UserResponseId userResponseId,
        CancellationToken ct = default);

    Task<bool> ExistsForUserAndQuestionAsync(UserId userId, QuestionId questionId, CancellationToken ct = default);
    Task DeleteByQuestionIdAsync(QuestionId questionId, CancellationToken ct = default);
    void Delete(UserResponseAggregate userResponse);
}