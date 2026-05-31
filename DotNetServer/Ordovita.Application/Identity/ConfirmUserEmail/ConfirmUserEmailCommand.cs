using Ordovita.Application.Common.Cqrs;

namespace Ordovita.Application.Identity.ConfirmUserEmail;

public sealed record ConfirmUserEmailCommand(
    string AspUserId
) : ICommand<Guid>;