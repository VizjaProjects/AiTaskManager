using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.LlmSettings.Port;

namespace Ordovita.Application.LlmSettings.GetLlmSettings;

public sealed record GetAllLlmSettingsQuery : IQuery<IReadOnlyList<LlmSettingsDto>>;

public class GetLlmSettingsHandler(
    ILlmSettingsRepository repository,
    IUserRepository userRepository,
    IUserContext context)
    : IQueryHandler<GetAllLlmSettingsQuery, IReadOnlyList<LlmSettingsDto>>
{
    public async Task<Result<IReadOnlyList<LlmSettingsDto>>> Handle(GetAllLlmSettingsQuery query, CancellationToken ct)
    {
        if (context.UserId == null)
            return Result.Failure<IReadOnlyList<LlmSettingsDto>>(Error.Unauthorized("CreateLlmSettingsHandler",
                "Access denied"));

        var user = await userRepository.GetAsyncByAspId(context.UserId.Value.ToString(), ct);
        if (user == null)
            return Result.Failure<IReadOnlyList<LlmSettingsDto>>(Error.NotFound("CreateLlmSettingsHandler",
                "User not found"));

        var result = await repository.GetAllByUserIdAsync(user.Id, ct);

        IReadOnlyList<LlmSettingsDto> llmSettingsDto = result
            .Select(l => new LlmSettingsDto(l.Id.Value, l.UserId.Value, l.Provider, l.Model)).ToList()
            .AsReadOnly();

        return Result.Success(llmSettingsDto);
    }
}