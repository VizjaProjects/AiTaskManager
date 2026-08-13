using System.Collections.ObjectModel;
using Microsoft.EntityFrameworkCore;
using Ordovita.Application.Abstraction.Workspace;
using Ordovita.Domain.Workspace;
using Ordovita.Infrastructure.Persistence;

namespace Ordovita.Infrastructure.Workspace;

public class UserWorkspace(AppDbContext dbContext) : IUserWorkspace
{
    public async Task<IReadOnlyList<Application.Abstraction.Workspace.UserWorkspace>> GetAllWorkspaceUsersAsync(
        Guid workspaceId, Guid callingUserIdGuid, CancellationToken cancellationToken = default)
    {
        try
        {
            var data = await dbContext.Database.SqlQuery<Application.Abstraction.Workspace.UserWorkspace>($"""
                 SELECT DU.Id AS UserId, fullName AS FullName, email AS Email
                 FROM `Identity.DomainUser` as DU
                 LEFT JOIN WorkspaceUsers AS WU ON DU.Id = WU.UserId
                 WHERE  WU.WorkspaceId = {workspaceId} AND DU.Id != {callingUserIdGuid}
                 """).ToListAsync(cancellationToken);


            return data.Select(user =>
                    new Application.Abstraction.Workspace.UserWorkspace(user.UserId, user.FullName, user.Email))
                .ToList();
        }
        catch
        {
            return [];
        }
    }
}