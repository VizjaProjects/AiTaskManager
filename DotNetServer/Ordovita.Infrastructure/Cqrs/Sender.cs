using Microsoft.Extensions.DependencyInjection;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;

namespace Ordovita.Infrastructure.Cqrs;

public sealed class Sender(IServiceProvider sp) : ISender
{
    public Task<Result<TResult>> Send<TResult>(ICommand<TResult> command, CancellationToken ct = default)
    {
        var handlerType = typeof(ICommandHandler<,>)
            .MakeGenericType(command.GetType(), typeof(TResult));
        dynamic handler = sp.GetRequiredService(handlerType);

        var behaviors = sp.GetServices<IPipelineBehavior<TResult>>().Reverse();
        Func<Task<Result<TResult>>> next =
            () => (Task<Result<TResult>>)handler.Handle((dynamic)command, ct);

        foreach (var behavior in behaviors)
        {
            var current = next;
            next = () => behavior.Handle(command, current, ct);
        }

        return next();
    }

    public Task<Result<TResult>> Send<TResult>(IQuery<TResult> query, CancellationToken ct = default)
    {
        var handlerType = typeof(IQueryHandler<,>)
            .MakeGenericType(query.GetType(), typeof(TResult));
        dynamic handler = sp.GetRequiredService(handlerType);

        var behaviors = sp.GetServices<IPipelineBehavior<TResult>>().Reverse();
        Func<Task<Result<TResult>>> next =
            () => (Task<Result<TResult>>)handler.Handle((dynamic)query, ct);

        foreach (var behavior in behaviors)
        {
            var current = next;
            next = () => behavior.Handle(query, current, ct);
        }

        return next();
    }
}