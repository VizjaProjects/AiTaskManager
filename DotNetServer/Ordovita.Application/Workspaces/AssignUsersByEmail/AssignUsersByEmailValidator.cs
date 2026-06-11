using FluentValidation;

namespace Ordovita.Application.Workspaces.AssignUsersByEmail;

public sealed class AssignUsersByEmailValidator : AbstractValidator<AssignUsersByEmailCommand>
{
    public AssignUsersByEmailValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.Emails).NotEmpty();
        RuleForEach(x => x.Emails).NotEmpty();
    }
}