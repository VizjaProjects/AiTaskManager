using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Tasks;
using Ordovita.Domain.Common;
using Ordovita.Domain.Note;
using Ordovita.Domain.Note.Port;

namespace Ordovita.Application.Note.DeleteNoteFolder;

public sealed record DeleteNoteFolderCommand(Guid WorkspaceId, Guid FolderId) : ICommand<Unit>;

public sealed class DeleteNoteFolderHandler(
    WorkspaceAccessGuard accessGuard,
    INoteFolderRepository noteFolderRepository,
    INoteRepository noteRepository,
    IUnitOfWork uow) : ICommandHandler<DeleteNoteFolderCommand, Unit>
{
    public async Task<Result<Unit>> Handle(DeleteNoteFolderCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<Unit>(access.Error);

        var folderId = NoteFolderId.From(command.FolderId);
        var folder = await noteFolderRepository.GetByIdAsync(folderId, ct);
        if (folder is null || folder.WorkspaceId.Value != command.WorkspaceId)
            return Result.Failure<Unit>(new Error("NoteFolder.NotFound", "Folder not found in this workspace."));

        var notes = await noteRepository.GetByFolderIdAsync(folderId, ct);
        foreach (var note in notes)
            note.NoteFolderId = null;

        noteFolderRepository.Delete(folder);
        await uow.SaveChangesAsync(ct);

        return Result.Success(Unit.Value);
    }
}

public sealed class DeleteNoteFolderValidator : AbstractValidator<DeleteNoteFolderCommand>
{
    public DeleteNoteFolderValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.FolderId).NotEmpty();
    }
}