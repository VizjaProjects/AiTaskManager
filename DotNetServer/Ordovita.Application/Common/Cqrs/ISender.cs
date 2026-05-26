using Ordovita.Domain.Common;

namespace Ordovita.Application.Common.Cqrs;

public interface ISender
{
    Task<Result<TResult>> Send<TResult>(ICommand<TResult> command, CancellationToken ct = default);
    Task<Result<TResult>> Send<TResult>(IQuery<TResult> query, CancellationToken ct = default);
}