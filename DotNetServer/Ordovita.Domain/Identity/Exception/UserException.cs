using Ordovita.Domain.Common;

namespace Ordovita.Domain.Identity.Exception;

public static class UserException
{
    public static readonly Error MissingAspIdentityUserId =
        Error.Validation("DomainUser.MissingAspIdentityUserId", "AspIdentityUserId is required.");

    public static readonly Error MissingFullName =
        Error.Validation("DomainUser.MissingFullName", "Full name is required.");

    public static readonly Error SameRole =
        Error.Conflict("DomainUser.SameRole", "User already has this role.");

    public static readonly Error NotFound =
        Error.NotFound("DomainUser.NotFound", "User was not found.");

    public static readonly Error InvalidRole =
        Error.Validation("DomainUser.InvalidRole", "Provided role does not exist.");

    public static readonly Error AlreadyVerified =
        Error.Validation("DomainUser.AlreadyVerified", "User email is already verified.");
}