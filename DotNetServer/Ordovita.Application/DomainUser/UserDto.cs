using Ordovita.Domain.Identity;

namespace Ordovita.Application.User;

public sealed record UserDto(string FullName, Email Email, Role Role);