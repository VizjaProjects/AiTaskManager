using FluentValidation;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Tasks;
using Ordovita.Domain.Common;
using Ordovita.Domain.Note;
using Ordovita.Domain.Note.Port;

namespace Ordovita.Application.Note.GetNote;

public sealed record GetNoteQuery(Guid WorkspaceId, Guid NoteId) : IQuery<NoteDto>;


public sealed class GetNoteHandler(WorkspaceAccessGuard accessGuard, INoteRepository noteRepository)
    : IQueryHandler<GetNoteQuery, NoteDto>
{
    public async Task<Result<NoteDto>> Handle(GetNoteQuery query, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(query.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<NoteDto>(access.Error);

        var note = await noteRepository.GetByIdAsync(NoteId.From(query.NoteId), ct);
        if (note is null || note.WorkspaceId.Value != query.WorkspaceId)
            return Result.Failure<NoteDto>(
                Error.NotFound("Note.NotFound", "Note not found in this workspace."));

        return Result.Success(NoteMapper.ToDto(note));
    }
}

public sealed class GetNoteValidator : AbstractValidator<GetNoteQuery>
{
    public GetNoteValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.NoteId).NotEmpty();
    }
}
