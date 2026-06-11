using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Tasks;
using Ordovita.Domain.Common;
using Ordovita.Domain.Note.Port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Note.GetWorkspaceNoteFolders;

public sealed record GetWorkspaceNoteFoldersQuery(Guid WorkspaceId) : IQuery<IReadOnlyList<NoteFolderDto>>;

public class GetWorkspaceNoteFoldersHandler(
    WorkspaceAccessGuard accessGuard,
    INoteFolderRepository noteFolderRepository)
    : IQueryHandler<GetWorkspaceNoteFoldersQuery, IReadOnlyList<NoteFolderDto>>
{
    public async Task<Result<IReadOnlyList<NoteFolderDto>>> Handle(GetWorkspaceNoteFoldersQuery query,
        CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(query.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<IReadOnlyList<NoteFolderDto>>(access.Error);

        var folders = await noteFolderRepository.GetByWorkspaceIdAsync(WorkspaceId.From(query.WorkspaceId), ct);
        return Result.Success<IReadOnlyList<NoteFolderDto>>(folders.Select(NoteMapper.ToDto).ToList());
    }
}