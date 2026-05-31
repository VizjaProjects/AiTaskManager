using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.User;
using Ordovita.Domain.Identity;

namespace Ordovita.Application.DomainUser.ChangeFullname;

public sealed record ChangeFullNameCommand(string NewFullName) : ICommand<UserDto>;