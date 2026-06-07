using System.Security.Cryptography;
using System.Text;
using FluentValidation;
using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.LlmSettings;
using Ordovita.Domain.LlmSettings.Port;

namespace Ordovita.Application.LlmSettings.UpdateLlmSettings;

public sealed record UpdateLlmSettingsCommand(Guid LlmSettingsId, string ApiKey, string Provider, string Model)
    : ICommand<LlmSettingsDto>;

public class UpdateLlmSettingsHandler(
    ILlmSettingsRepository repository,
    IUserContext context,
    IUserRepository userRepository,
    IUnitOfWork uow)
    : ICommandHandler<UpdateLlmSettingsCommand, LlmSettingsDto>
{
    public async Task<Result<LlmSettingsDto>> Handle(UpdateLlmSettingsCommand command, CancellationToken ct)
    {
        var llmSettingsId = LlmSettingsId.From(command.LlmSettingsId);
        var llmSettings = await repository.GetByIdAsync(llmSettingsId, ct);

        if (llmSettings == null)
            return Result.Failure<LlmSettingsDto>(Error.NotFound("GetLlmSettingsByIdHandler",
                "Llm settings not found"));

        if (context.UserId == null)
            return Result.Failure<LlmSettingsDto>(Error.Unauthorized("CreateLlmSettingsHandler", "Access denied"));


        var user = await userRepository.GetAsyncByAspId(context.UserId.Value.ToString(), ct);

        if (user == null)
            return Result.Failure<LlmSettingsDto>(Error.NotFound("GetLlmSettingsByIdHandler", "User not found"));

        var hashedApiKey = GetHash(llmSettings.ApiKey);

        var updatedLlmSettings = llmSettings.Update(user.Id, hashedApiKey, command.Provider, command.Model, user.Id);


        if (updatedLlmSettings.Value == null || updatedLlmSettings.IsFailure)
            return Result.Failure<LlmSettingsDto>(updatedLlmSettings.Error);

        await uow.SaveChangesAsync(ct);

        return Result.Success(new LlmSettingsDto(updatedLlmSettings.Value.Id.Value,
            updatedLlmSettings.Value.UserId.Value,
            updatedLlmSettings.Value.Provider, updatedLlmSettings.Value.Model));
    }

    private static string GetHash(string inputString)
    {
        byte[] hashedApiKey;
        using (HashAlgorithm algorithm = SHA256.Create())
        {
            hashedApiKey = algorithm.ComputeHash(Encoding.UTF8.GetBytes(inputString));
        }

        var sb = new StringBuilder();

        foreach (var b in hashedApiKey) sb.Append(b.ToString("X2"));

        return sb.ToString();
    }
}

public sealed class UpdateLlmSettingsHandlerValidator : AbstractValidator<UpdateLlmSettingsCommand>
{
    public UpdateLlmSettingsHandlerValidator()
    {
        RuleFor(x => x.LlmSettingsId).NotNull().WithMessage("LlmSettingsId is required");
        RuleFor(x => x.ApiKey).NotNull().WithMessage("ApiKey is required");
        RuleFor(x => x.Provider).NotNull().WithMessage("Provider is required");
        RuleFor(x => x.Model).NotNull().WithMessage("Model is required");
    }
}