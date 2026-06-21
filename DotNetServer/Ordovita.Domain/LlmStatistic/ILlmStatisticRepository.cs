using Ordovita.Domain.Identity;

namespace Ordovita.Domain.LlmStatistic;

public interface ILlmStatisticRepository
{
    Task AddAsync(LlmStatistic llmStatistic, CancellationToken cancellationToken = default);

    Task<int> CountByRequestedAtAndRequestedBy(UserId requestedBy,
        CancellationToken cancellationToken = default);
}