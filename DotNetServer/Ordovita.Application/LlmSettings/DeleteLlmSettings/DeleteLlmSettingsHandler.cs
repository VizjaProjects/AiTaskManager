using FluentValidation;
using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.LlmSettings;
using Ordovita.Domain.LlmSettings.Port;

namespace Ordovita.Application.LlmSettings.DeleteLlmSettings;

public sealed record DeleteLlmSettingsCommand(Guid LlmSettingId) : ICommand<Unit>;

public class DeleteLlmSettingsHandler(IUserContext context, ILlmSettingsRepository repository, IUnitOfWork uow)
    : ICommandHandler<DeleteLlmSettingsCommand, Unit>
{
    public async Task<Result<Unit>> Handle(DeleteLlmSettingsCommand command, CancellationToken ct)
    {
        if (context.UserId == null)
            return Result.Failure<Unit>(Error.Unauthorized("CreateLlmSettingsHandler", "Access denied"));

        var result = await repository.GetByIdAsync(LlmSettingsId.From(command.LlmSettingId), ct);

        if (result == null)
            return Result.Failure<Unit>(Error.NotFound("GetLlmSettingsByIdHandler", "Llm setting not found"));

        result.Delete(new UserId(context.UserId.Value));

        repository.Delete(result);
        await uow.SaveChangesAsync(ct);

        return Result.Success(Unit.Value);
    }
}

public sealed class DeleteLlmSettingsValidator : AbstractValidator<DeleteLlmSettingsCommand>
{
    public DeleteLlmSettingsValidator()
    {
        RuleFor(x => x.LlmSettingId).NotEmpty().WithMessage("Llm settings id cannot be empty");
    }
}