using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Tasks;
using Ordovita.Domain.Common;
using Ordovita.Domain.Note;
using Ordovita.Domain.Note.Port;

namespace Ordovita.Application.Note.UpdateNoteContent;

public sealed record UpdateNoteContentCommand(Guid WorkspaceId, Guid NoteId, string ContentJson) : ICommand<Unit>;

public sealed class UpdateNoteContentHandler(
    WorkspaceAccessGuard accessGuard,
    INoteRepository noteRepository,
    IUnitOfWork uow) : ICommandHandler<UpdateNoteContentCommand, Unit>
{
    public async Task<Result<Unit>> Handle(UpdateNoteContentCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<Unit>(access.Error);

        var note = await noteRepository.GetByIdAsync(NoteId.From(command.NoteId), ct);
        if (note is null || note.WorkspaceId.Value != command.WorkspaceId)
            return Result.Failure<Unit>(new Error("Note.NotFound", "Note not found in this workspace."));

        var noteContent = NoteContent.FromJson(command.ContentJson);
        note.UpdateContent(noteContent);

        await uow.SaveChangesAsync(ct);
        return Result.Success(Unit.Value);
    }
}

public sealed class UpdateNoteContentValidator : AbstractValidator<UpdateNoteContentCommand>
{
    public UpdateNoteContentValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.NoteId).NotEmpty();
        RuleFor(x => x.ContentJson).NotEmpty();
    }
}