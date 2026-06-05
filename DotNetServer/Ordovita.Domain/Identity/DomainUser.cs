using Ordovita.Domain.Common;
using Ordovita.Domain.Identity.Event;
using Ordovita.Domain.Identity.Exception;

namespace Ordovita.Domain.Identity;

public sealed class DomainUser : AggregateRoot<UserId>
{
    public string FullName { get; private set; }
    public Email Email { get; private set; }
    public Role Role { get; private set; }
    public bool IsEnable { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }
    public bool IsEmailVerified { get; private set; }
    public DateTime EmailVerificationAt { get; private set; }
    public string AspIdentityUserId { get; private set; }

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

    public Result VerifyEmail()
    {
        if (IsEmailVerified && EmailVerificationAt < DateTime.UtcNow)
            return Result.Failure(UserException.AlreadyVerified);

        IsEmailVerified = true;
        EmailVerificationAt = DateTime.UtcNow;
        IsEnable = true;
        UpdatedAt = DateTime.UtcNow;


        return Result.Success();
    }

    public Result ChangeFullname(string newFullName)
    {
        if (FullName.Equals(newFullName))
            return Result.Failure(Error.Conflict("ChangeFullname", "Fullname is same as old Fullname!"));

        FullName = newFullName;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result DeleteAccount()
    {
        if (!IsEnable) return Result.Failure(Error.Conflict("DeleteAccount", "Account is already deleted!"));

        IsEnable = false;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }
}