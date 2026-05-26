using Ordovita.Domain.Common;
using Ordovita.Domain.Identity.Event;
using Ordovita.Domain.Identity.Exception;

namespace Ordovita.Domain.Identity;

public sealed class DomainUser : AggregateRoot<UserId>
{
    public string FullName { get; private set; }
    public Email Email { get; private set; }
    public Role Role { get; private set; }
    public bool IsEnable { get; set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }
    public bool IsEmailVerified { get; set; }
    public DateTime EmailVerificationAt { get; set; }
    public string AspIdentityUserId { get; set; }

    private DomainUser()
    {
    }

    public static Result<DomainUser> Create(string fullName, Email email, Role role, string aspIdentityUserId)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            return Result.Failure<DomainUser>(UserException.MissingFullName);
        if (string.IsNullOrWhiteSpace(aspIdentityUserId))
            return Result.Failure<DomainUser>(UserException.MissingAspIdentityUserId);

        var domainUser = new DomainUser
        {
            Id = UserId.New(),
            FullName = fullName,
            Email = email,
            Role = role,
            IsEnable = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsEmailVerified = false,
            AspIdentityUserId = aspIdentityUserId
        };

        domainUser.RaiseDomainEvent(new UserCreated(domainUser.Id, domainUser.Role, domainUser.Email,
            domainUser.FullName, domainUser.AspIdentityUserId));

        return Result.Success(domainUser);
    }
}