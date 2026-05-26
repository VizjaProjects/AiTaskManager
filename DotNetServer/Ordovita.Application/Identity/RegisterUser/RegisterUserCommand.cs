using System.Windows.Input;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Identity;

namespace Ordovita.Application.Identity.RegisterUser;

public sealed record RegisterUserCommand(
    string FullName,
    string Email,
    string Password,
    Role Role = Role.USER
) : ICommand<Guid>;