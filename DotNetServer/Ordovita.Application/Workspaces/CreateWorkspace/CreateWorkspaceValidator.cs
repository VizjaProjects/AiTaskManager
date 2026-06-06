using FluentValidation;

namespace Ordovita.Application.Workspaces.CreateWorkspace;

public sealed class CreateWorkspaceValidator : AbstractValidator<CreateWorkspaceCommand>
{
    public CreateWorkspaceValidator()
    {
        RuleFor(x => x.WorkspaceName).NotEmpty().MaximumLength(200);

        RuleForEach(x => x.AssignedUserIds)
            .NotEmpty()
            .When(x => x.AssignedUserIds is { Count: > 0 });
    }
}