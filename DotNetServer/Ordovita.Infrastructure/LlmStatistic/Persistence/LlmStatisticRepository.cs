using Microsoft.EntityFrameworkCore;
using Ordovita.Domain.Identity;
using Ordovita.Domain.LlmStatistic;
using Ordovita.Infrastructure.Persistence;

namespace Ordovita.Infrastructure.LlmStatistic.Persistence;

public class LlmStatisticRepository(AppDbContext context) : ILlmStatisticRepository
{
    public async Task AddAsync(Domain.LlmStatistic.LlmStatistic llmStatistic, CancellationToken cancellationToken = default)
    {
        await context.AddAsync(llmStatistic, cancellationToken);
    }

    public async Task<int> CountByRequestedAtAndRequestedBy(UserId requestedBy,
        CancellationToken cancellationToken = default)
    {
        var result = await context.Database.SqlQuery<int>($"""
                                                           SELECT COUNT(Id) AS Value
                                                           FROM `LlmStatistic.LlmStatistics`
                                                           WHERE RequestType = 'Standard' 
                                                             AND DATE(RequestedAt) = {DateTime.UtcNow.Date} 
                                                             AND RequestedBy = {requestedBy.Value}
                                                           """).FirstOrDefaultAsync(cancellationToken);

        return result;
    }
}