using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Tasks;
using Ordovita.Domain.Common;
using Ordovita.Domain.Note;
using Ordovita.Domain.Note.Port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Note.CreateNote;

public sealed record CreateNoteCommand(
    Guid WorkspaceId,
    Guid? NoteFolderId,
    string Title,
    string NoteColor,
    string ContentJson,
    string NoteDescription)
    : ICommand<CreateNoteResult>;

public sealed record CreateNoteResult(Guid Id, DateTime CreatedAt);

public sealed class CreateNoteHandler(
    WorkspaceAccessGuard accessGuard,
    INoteRepository noteRepository,
    IUnitOfWork uow) : ICommandHandler<CreateNoteCommand, CreateNoteResult>
{
    public async Task<Result<CreateNoteResult>> Handle(CreateNoteCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<CreateNoteResult>(access.Error);

        var noteFolderId = command.NoteFolderId.HasValue
            ? NoteFolderId.From(command.NoteFolderId.Value)
            : (NoteFolderId?)null;
        var noteContent = NoteContent.FromJson(command.ContentJson);

        var noteResult = Domain.Note.Note.Create(
            WorkspaceId.From(command.WorkspaceId),
            command.Title,
            command.NoteColor,
            noteContent,
            access.Value.User.Id,
            noteFolderId,
            command.NoteDescription
        );

        if (noteResult.IsFailure)
            return Result.Failure<CreateNoteResult>(noteResult.Error);

        await noteRepository.AddAsync(noteResult.Value!, ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success(new CreateNoteResult(noteResult.Value!.Id.Value, noteResult.Value.CreatedAt));
    }
}

public sealed class CreateNoteValidator : AbstractValidator<CreateNoteCommand>
{
    public CreateNoteValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(255);
        RuleFor(x => x.NoteColor).NotEmpty().MaximumLength(7);
        RuleFor(x => x.ContentJson).NotEmpty();
    }
}