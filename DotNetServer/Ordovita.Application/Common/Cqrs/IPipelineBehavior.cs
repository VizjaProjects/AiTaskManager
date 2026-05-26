using Ordovita.Domain.Common;

namespace Ordovita.Application.Common.Cqrs;

public interface IPipelineBehavior<TResult>
{
    Task<Result<TResult>> Handle(
        object request,
        Func<Task<Result<TResult>>> next,
        CancellationToken ct);
}