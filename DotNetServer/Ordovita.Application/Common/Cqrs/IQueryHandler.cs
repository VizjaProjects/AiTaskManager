using Ordovita.Domain.Common;

namespace Ordovita.Application.Common.Cqrs;

public interface IQueryHandler<TQuery, TResult>
    where TQuery : IQuery<TResult>
{
    Task<Result<TResult>> Handle(TQuery query, CancellationToken ct);
}