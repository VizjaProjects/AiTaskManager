using FluentValidation;

namespace Ordovita.Application.Identity.RegisterUser;

public class RegisterUserValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserValidator()
    {
        RuleFor(user => user.Email).NotEmpty().EmailAddress().WithMessage("Invalid email address.");
        RuleFor(user => user.Password).NotEmpty().WithMessage("Password is required.");
        RuleFor(user => user.FullName).NotEmpty().WithMessage("Name is required.");
    }
}