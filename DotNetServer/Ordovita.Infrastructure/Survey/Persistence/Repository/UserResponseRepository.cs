using Microsoft.EntityFrameworkCore;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Surveys.port;
using Ordovita.Domain.Surveys.Questions;
using Ordovita.Infrastructure.Persistence;
using UserResponseAggregate = Ordovita.Domain.Surveys.UserResponse.UserResponse;
using UserResponseId = Ordovita.Domain.Surveys.UserResponse.UserResponseId;

namespace Ordovita.Infrastructure.Survey.Persistence.Repository;

public class UserResponseRepository(AppDbContext context) : IUserResponseRepository
{
    public async Task AddAsync(UserResponseAggregate userResponse, CancellationToken ct = default)
    {
        await context.UserResponses.AddAsync(userResponse, ct);
    }

    public async Task<UserResponseAggregate?> GetByIdAsync(UserResponseId userResponseId, CancellationToken ct = default)
    {
        return await context.UserResponses.FirstOrDefaultAsync(u => u.Id == userResponseId, ct);
    }

    public async Task<IReadOnlyList<UserResponseAggregate>> GetAllByUserIdAsync(UserId userId, CancellationToken ct = default)
    {
        return await context.UserResponses
            .Where(u => u.UserId == userId)
            .ToListAsync(ct);
    }

    public async Task<UserResponseAggregate?> GetByUserAndResponseIdAsync(
        UserId userId, UserResponseId userResponseId, CancellationToken ct = default)
    {
        return await context.UserResponses
            .FirstOrDefaultAsync(u => u.UserId == userId && u.Id == userResponseId, ct);
    }

    public async Task<bool> ExistsForUserAndQuestionAsync(
        UserId userId, QuestionId questionId, CancellationToken ct = default)
    {
        return await context.UserResponses
            .AnyAsync(u => u.UserId == userId && u.QuestionId == questionId, ct);
    }

    public void Delete(UserResponseAggregate userResponse)
    {
        context.UserResponses.Remove(userResponse);
    }

    public async Task DeleteByQuestionIdAsync(QuestionId questionId, CancellationToken ct = default)
    {
        await context.UserResponses
            .Where(r => r.QuestionId == questionId)
            .ExecuteDeleteAsync(ct);
    }
}
