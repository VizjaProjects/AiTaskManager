using Ordovita.Domain.Common;

namespace Ordovita.Domain.Identity.Event;

public sealed record UserCreated(UserId UserId, Role Role, Email Email, string FullName, string AspIdentityUserId)
    : IDomainEvent;