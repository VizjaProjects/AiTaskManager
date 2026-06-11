using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Workspaces;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Workspace;
using Ordovita.Domain.Workspace.Exception;
using Ordovita.Domain.Workspace.port;

namespace Ordovita.Application.Workspaces.AssignUsersByEmail;

public sealed class AssignUsersByEmailHandler(
    IUserContext userContext,
    IUserRepository userRepository,
    IWorkspaceRepository workspaceRepository,
    IUnitOfWork uow) : ICommandHandler<AssignUsersByEmailCommand, AssignUsersByEmailResult>
{
    public async Task<Result<AssignUsersByEmailResult>> Handle(AssignUsersByEmailCommand command, CancellationToken ct)
    {
        var userResult = await WorkspaceUserResolver.GetCurrentDomainUserAsync(userContext, userRepository, ct);
        if (userResult.IsFailure)
            return Result.Failure<AssignUsersByEmailResult>(userResult.Error);

        var workspace = await workspaceRepository.GetByIdAsync(WorkspaceId.From(command.WorkspaceId), ct);
        if (workspace is null)
            return Result.Failure<AssignUsersByEmailResult>(WorkspaceException.NotFound);

        var notFound = new List<string>();
        var alreadyAssigned = new List<string>();
        var added = new List<string>();
        var toAssign = new List<UserId>();

        var seenEmails = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var rawEmail in command.Emails)
        {
            var normalized = rawEmail.Trim();
            if (normalized.Length == 0 || !seenEmails.Add(normalized))
                continue;

            Email email;
            try
            {
                email = Email.From(normalized);
            }
            catch (ArgumentException)
            {
                notFound.Add(normalized);
                continue;
            }

            var user = await userRepository.GetAsyncByEmail(email, ct);
            if (user is null)
            {
                notFound.Add(normalized);
                continue;
            }

            if (workspace.AssignedUsers.Any(u => u.UserId == user.Id))
            {
                alreadyAssigned.Add(normalized);
                continue;
            }

            toAssign.Add(user.Id);
            added.Add(normalized);
        }

        if (toAssign.Count > 0)
        {
            var addResult = workspace.AddUserToWorkspace(toAssign, userResult.Value!.Id);
            if (addResult.IsFailure)
                return Result.Failure<AssignUsersByEmailResult>(addResult.Error);

            await uow.SaveChangesAsync(ct);
        }

        var dto = await WorkspaceMapper.ToDtoAsync(workspace, userRepository, ct);
        return Result.Success(new AssignUsersByEmailResult(dto, added, notFound, alreadyAssigned));
    }
}