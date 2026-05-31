using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Ordovita.Application.Abstraction.Identity;

namespace Ordovita.Infrastructure.Identity;

public class UserContext(IHttpContextAccessor accessor) : IUserContext
{
    private IHttpContextAccessor Accessor { get; } = accessor;

    public Guid? UserId =>
        Guid.TryParse(Accessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : null;
}