using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Tasks;
using Ordovita.Domain.Common;
using Ordovita.Domain.Note.Port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Note.GetWorkspaceNotes;

public sealed record GetWorkspaceNotesQuery(Guid WorkspaceId) : IQuery<IReadOnlyList<NoteDto>>;

public class GetWorkspaceNotesHandler(WorkspaceAccessGuard accessGuard, INoteRepository noteRepository)
    : IQueryHandler<GetWorkspaceNotesQuery, IReadOnlyList<NoteDto>>
{
    public async Task<Result<IReadOnlyList<NoteDto>>> Handle(GetWorkspaceNotesQuery query, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(query.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<IReadOnlyList<NoteDto>>(access.Error);

        var notes = await noteRepository.GetByWorkspaceIdAsync(WorkspaceId.From(query.WorkspaceId), ct);
        return Result.Success<IReadOnlyList<NoteDto>>(notes.Select(NoteMapper.ToDto).ToList());
    }
}