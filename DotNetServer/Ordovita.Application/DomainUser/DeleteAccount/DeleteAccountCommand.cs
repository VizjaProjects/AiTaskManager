using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.User;

namespace Ordovita.Application.DomainUser.DeleteAccount;

public sealed record DeleteAccountCommand : ICommand<UserDto>;