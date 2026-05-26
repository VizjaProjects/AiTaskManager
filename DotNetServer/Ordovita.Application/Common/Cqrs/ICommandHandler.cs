using Ordovita.Domain.Common;

namespace Ordovita.Application.Common.Cqrs;

public interface ICommandHandler<TCommand, TResult>
    where TCommand : ICommand<TResult>
{
    Task<Result<TResult>> Handle(TCommand command, CancellationToken ct);
}