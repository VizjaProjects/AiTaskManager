using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.LlmSettings.Port;

namespace Ordovita.Application.LlmSettings.CreateLlmSettings;

public sealed record CreateLlmSettingsCommand(Guid UserId, string Provider, string Model, string ApiKey) : ICommand<LlmSettingsDto>;

public class CreateLlmSettingsHandler(ILlmSettingsRepository repository, IUserRepository userRepository, IUserContext context, IUnitOfWork uow) : ICommandHandler<CreateLlmSettingsCommand, LlmSettingsDto>
{
    public async Task<Result<LlmSettingsDto>> Handle(CreateLlmSettingsCommand query, CancellationToken ct)
    {
        var s = context.UserId;
        // var user = await userRepository.GetAsyncById(UserId.From(context.UserId.Value))

        return null;
    }
}