using FluentValidation;

namespace Ordovita.Application.Workspaces.DeleteWorkspace;

public sealed class DeleteWorkspaceValidator : AbstractValidator<DeleteWorkspaceCommand>
{
    public DeleteWorkspaceValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
    }
}