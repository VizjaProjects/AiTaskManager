using FluentValidation;
using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Workspace;
using Ordovita.Domain.Workspace.Exception;
using Ordovita.Domain.Workspace.port;

namespace Ordovita.Application.Workspaces.ChangeWorkspaceVisibility;

public sealed record ChangeWorkspaceVisibilityCommand(
    Guid WorkspaceId,
    WorkspaceVisibility Visibility) : ICommand<WorkspaceDto>;

public sealed class ChangeWorkspaceVisibilityHandler(
    IUserContext userContext,
    IUserRepository userRepository,
    IWorkspaceRepository workspaceRepository,
    IUnitOfWork uow) : ICommandHandler<ChangeWorkspaceVisibilityCommand, WorkspaceDto>
{
    public async Task<Result<WorkspaceDto>> Handle(ChangeWorkspaceVisibilityCommand command, CancellationToken ct)
    {
        var userResult = await WorkspaceUserResolver.GetCurrentDomainUserAsync(userContext, userRepository, ct);
        if (userResult.IsFailure)
            return Result.Failure<WorkspaceDto>(userResult.Error);

        var workspace = await workspaceRepository.GetByIdAsync(WorkspaceId.From(command.WorkspaceId), ct);
        if (workspace is null)
            return Result.Failure<WorkspaceDto>(WorkspaceException.NotFound);

        var result = workspace.ChangeVisibility(command.Visibility, userResult.Value!.Id);
        if (result.IsFailure)
            return Result.Failure<WorkspaceDto>(result.Error);

        await uow.SaveChangesAsync(ct);
        return Result.Success(await WorkspaceMapper.ToDtoAsync(workspace, userRepository, ct));
    }
}

public sealed class ChangeWorkspaceVisibilityValidator : AbstractValidator<ChangeWorkspaceVisibilityCommand>
{
    public ChangeWorkspaceVisibilityValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.Visibility).IsInEnum();
    }
}