using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Tasks;
using Ordovita.Domain.Common;
using Ordovita.Domain.Note;
using Ordovita.Domain.Note.Port;

namespace Ordovita.Application.Note.UpdateNoteFolder;

public sealed record UpdateNoteFolderCommand(
    Guid WorkspaceId,
    Guid FolderId,
    string Title,
    string? Description) : ICommand<Unit>;

public sealed class UpdateNoteFolderHandler(
    WorkspaceAccessGuard accessGuard,
    INoteFolderRepository noteFolderRepository,
    IUnitOfWork uow) : ICommandHandler<UpdateNoteFolderCommand, Unit>
{
    public async Task<Result<Unit>> Handle(UpdateNoteFolderCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<Unit>(access.Error);

        var folder = await noteFolderRepository.GetByIdAsync(NoteFolderId.From(command.FolderId), ct);
        if (folder is null || folder.WorkspaceId.Value != command.WorkspaceId)
            return Result.Failure<Unit>(new Error("NoteFolder.NotFound", "Folder not found in this workspace."));

        var update = folder.Update(command.Title, command.Description);
        if (update.IsFailure)
            return Result.Failure<Unit>(update.Error);

        await uow.SaveChangesAsync(ct);
        return Result.Success(Unit.Value);
    }
}

public sealed class UpdateNoteFolderValidator : AbstractValidator<UpdateNoteFolderCommand>
{
    public UpdateNoteFolderValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.FolderId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Description).MaximumLength(1000);
    }
}