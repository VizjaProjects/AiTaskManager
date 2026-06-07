using System.Security.Cryptography;
using System.Text;
using FluentValidation;
using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.LlmSettings.Port;

namespace Ordovita.Application.LlmSettings.CreateLlmSettings;

public sealed record CreateLlmSettingsCommand(string? Provider, string Model, string ApiKey, Uri? CustomUrl)
    : ICommand<LlmSettingsDto>;

public class CreateLlmSettingsHandler(
    ILlmSettingsRepository repository,
    IUserRepository userRepository,
    IUserContext context,
    IUnitOfWork uow) : ICommandHandler<CreateLlmSettingsCommand, LlmSettingsDto>
{
    public async Task<Result<LlmSettingsDto>> Handle(CreateLlmSettingsCommand requst, CancellationToken ct)
    {
        if (context.UserId == null)
            return Result.Failure<LlmSettingsDto>(Error.Unauthorized("CreateLlmSettingsHandler", "Access denied"));
        var user = await userRepository.GetAsyncByAspId(context.UserId.Value.ToString(), ct);

        if (user == null)
            return Result.Failure<LlmSettingsDto>(Error.NotFound("CreateLlmSettingsHandler", "User not found"));

        var hashedApiKey = GetHash(requst.ApiKey);

        var llmSettings =
            Domain.LlmSettings.LlmSettings.Create(user.Id, hashedApiKey, requst.Provider, requst.Model,
                requst.CustomUrl);

        if (llmSettings.Value == null || llmSettings.IsFailure)
            return Result.Failure<LlmSettingsDto>(llmSettings.Error);

        await repository.AddAsync(llmSettings.Value, ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success(new LlmSettingsDto(llmSettings.Value.Id.Value, llmSettings.Value.UserId.Value,
            llmSettings.Value.Provider,
            llmSettings.Value.Model));
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

public sealed class CreateLlmSettingValidator : AbstractValidator<CreateLlmSettingsCommand>
{
    public CreateLlmSettingValidator()
    {
        RuleFor(command => command.Model).NotEmpty().WithMessage("Model is required");
        RuleFor(command => command.ApiKey).NotEmpty().WithMessage("Api key is required");
    }
}