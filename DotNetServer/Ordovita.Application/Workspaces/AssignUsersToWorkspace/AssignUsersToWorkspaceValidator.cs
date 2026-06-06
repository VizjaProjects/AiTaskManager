using FluentValidation;

namespace Ordovita.Application.Workspaces.AssignUsersToWorkspace;

public sealed class AssignUsersToWorkspaceValidator : AbstractValidator<AssignUsersToWorkspaceCommand>
{
    public AssignUsersToWorkspaceValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.UserIds).NotEmpty();
        RuleForEach(x => x.UserIds).NotEmpty();
    }
}