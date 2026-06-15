using FluentValidation;
using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.User;
using Ordovita.Application.Workspaces;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.DomainUser.SetupDefaultWorkspace;

public sealed record SetUpDefaultWorkspaceCommand(Guid WorkspaceId) : ICommand<UserDto>;

public class SetUpDefaultWorkspaceHandler(IUserRepository userRepository, IUnitOfWork uow, IUserContext userContext)
    : ICommandHandler<SetUpDefaultWorkspaceCommand, UserDto>
{
    public async Task<Result<UserDto>> Handle(SetUpDefaultWorkspaceCommand command, CancellationToken ct)
    {
        var userResult = await WorkspaceUserResolver.GetCurrentDomainUserAsync(userContext, userRepository, ct);
        if (userResult.IsFailure || userResult.Value == null)
            return Result.Failure<UserDto>(userResult.Error);

        var workspaceId = WorkspaceId.From(command.WorkspaceId);
        var setupResult = userResult.Value.SetupDefaultWorkspace(workspaceId);
        if (setupResult.IsFailure)
            return Result.Failure<UserDto>(setupResult.Error);

        await uow.SaveChangesAsync(ct);

        var user = userResult.Value;
        return Result.Success(new UserDto(user.FullName, user.Email, user.Role));
    }
}

public sealed class SetUpDefaultWorkspaceValidator : AbstractValidator<SetUpDefaultWorkspaceCommand>
{
    public SetUpDefaultWorkspaceValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty().WithMessage("Workspace Id cannot be empty");
    }
}