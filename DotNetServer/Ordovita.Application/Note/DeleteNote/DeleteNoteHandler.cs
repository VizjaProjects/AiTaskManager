using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Tasks;
using Ordovita.Domain.Common;
using Ordovita.Domain.Note;
using Ordovita.Domain.Note.Port;

namespace Ordovita.Application.Note.DeleteNote;

public sealed record DeleteNoteCommand(Guid WorkspaceId, Guid NoteId) : ICommand<Unit>;

public sealed class DeleteNoteHandler(
    WorkspaceAccessGuard accessGuard,
    INoteRepository noteRepository,
    IUnitOfWork uow) : ICommandHandler<DeleteNoteCommand, Unit>
{
    public async Task<Result<Unit>> Handle(DeleteNoteCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<Unit>(access.Error);

        var note = await noteRepository.GetByIdAsync(NoteId.From(command.NoteId), ct);
        if (note is null || note.WorkspaceId.Value != command.WorkspaceId)
            return Result.Failure<Unit>(new Error("Note.NotFound", "Note not found in this workspace."));

        noteRepository.Delete(note);
        await uow.SaveChangesAsync(ct);

        return Result.Success(Unit.Value);
    }
}

public sealed class DeleteNoteValidator : AbstractValidator<DeleteNoteCommand>
{
    public DeleteNoteValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.NoteId).NotEmpty();
    }
}