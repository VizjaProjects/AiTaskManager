using FluentValidation;

namespace Ordovita.Application.Workspaces.RemoveUsersFromWorkspace;

public sealed class RemoveUsersFromWorkspaceValidator : AbstractValidator<RemoveUsersFromWorkspaceCommand>
{
    public RemoveUsersFromWorkspaceValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.UserIds).NotEmpty();
        RuleForEach(x => x.UserIds).NotEmpty();
    }
}