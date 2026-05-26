namespace Ordovita.Application.Common.Cqrs;

public interface ICommand<TResult>
{
}

public interface ICommand : ICommand<Unit>
{
}