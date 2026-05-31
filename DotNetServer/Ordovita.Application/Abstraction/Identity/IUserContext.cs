namespace Ordovita.Application.Abstraction.Identity;

public interface IUserContext
{
    Guid? UserId { get; }
}