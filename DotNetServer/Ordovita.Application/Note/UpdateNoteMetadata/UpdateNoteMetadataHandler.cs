using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Tasks;
using Ordovita.Domain.Common;
using Ordovita.Domain.Note;
using Ordovita.Domain.Note.Port;

namespace Ordovita.Application.Note.UpdateNoteMetadata;

public sealed record UpdateNoteMetadataCommand(
    Guid WorkspaceId,
    Guid NoteId,
    string Title,
    string NoteColor,
    string NoteDescription,
    Guid? NoteFolderId) : ICommand<Unit>;

public sealed class UpdateNoteMetadataHandler(
    WorkspaceAccessGuard accessGuard,
    INoteRepository noteRepository,
    IUnitOfWork uow) : ICommandHandler<UpdateNoteMetadataCommand, Unit>
{
    public async Task<Result<Unit>> Handle(UpdateNoteMetadataCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<Unit>(access.Error);

        var note = await noteRepository.GetByIdAsync(NoteId.From(command.NoteId), ct);
        if (note is null || note.WorkspaceId.Value != command.WorkspaceId)
            return Result.Failure<Unit>(new Error("Note.NotFound", "Note not found in this workspace."));

        var folderId = command.NoteFolderId.HasValue
            ? NoteFolderId.From(command.NoteFolderId.Value)
            : (NoteFolderId?)null;
        note.UpdateMetadata(command.Title, command.NoteColor, folderId, command.NoteDescription);

        await uow.SaveChangesAsync(ct);
        return Result.Success(Unit.Value);
    }
}

public sealed class UpdateNoteMetadataValidator : AbstractValidator<UpdateNoteMetadataCommand>
{
    public UpdateNoteMetadataValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.NoteId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(255);
        RuleFor(x => x.NoteColor).NotEmpty().MaximumLength(7);
    }
}