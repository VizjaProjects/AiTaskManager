using FluentValidation;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;

namespace Ordovita.Application.Common.Behaviors;

public sealed class ValidationBehavior<TResult>(IServiceProvider sp)
    : IPipelineBehavior<TResult>
{
    public async Task<Result<TResult>> Handle(
        object request,
        Func<Task<Result<TResult>>> next,
        CancellationToken ct)
    {
        var validatorType = typeof(IValidator<>).MakeGenericType(request.GetType());
        dynamic? validator = sp.GetService(validatorType);

        if (validator is null)
            return await next();

        FluentValidation.Results.ValidationResult validation =
            await validator.ValidateAsync((dynamic)request, ct);

        if (!validation.IsValid)
        {
            var description = string.Join("; ", validation.Errors.Select(e => e.ErrorMessage));
            return Result.Failure<TResult>(Error.Validation("Validation.Failed", description));
        }

        return await next();
    }
}