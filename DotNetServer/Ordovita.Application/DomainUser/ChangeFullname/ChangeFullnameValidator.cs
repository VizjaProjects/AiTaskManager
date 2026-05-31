using FluentValidation;

namespace Ordovita.Application.DomainUser.ChangeFullname;

public class ChangeFullnameValidator : AbstractValidator<ChangeFullNameCommand>
{
    public ChangeFullnameValidator()
    {
        RuleFor(c => c.NewFullName).NotEmpty().WithMessage("New fullname is required");
    }
}