using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Workspace;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;


namespace Ordovita.Application.Workspaces.GetWorkspaceUsers;

public record GetWorkspaceUsersQuery(Guid WorkspaceId) : IQuery<IReadOnlyList<UserWorkspace>>;

public sealed class GetWorkspaceUsersHandler(
    IUserContext userContext,
    IUserWorkspace userWorkspace,
    IUserRepository userRepository
) : IQueryHandler<GetWorkspaceUsersQuery, IReadOnlyList<UserWorkspace>>
{
    public async Task<Result<IReadOnlyList<UserWorkspace>>> Handle(GetWorkspaceUsersQuery query, CancellationToken ct)
    {
        var userResult = await WorkspaceUserResolver.GetCurrentDomainUserAsync(userContext, userRepository, ct);
        if (userResult.IsFailure)
            return Result.Failure<IReadOnlyList<UserWorkspace>>(userResult.Error);

        var result = await userWorkspace.GetAllWorkspaceUsersAsync(query.WorkspaceId, userResult.Value!.Id.Value, ct);

        return Result.Success<IReadOnlyList<UserWorkspace>>(result);
    }
}