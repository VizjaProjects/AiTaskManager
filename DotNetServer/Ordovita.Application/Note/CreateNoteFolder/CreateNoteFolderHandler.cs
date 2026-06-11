using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Tasks;
using Ordovita.Domain.Common;
using Ordovita.Domain.Note;
using Ordovita.Domain.Note.Port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Note.CreateNoteFolder;

public sealed record CreateNoteFolderCommand(Guid WorkspaceId, string Title)
    : ICommand<CreateNoteFolderResult>;

public sealed record CreateNoteFolderResult(Guid Id, DateTime CreatedAt);

public class CreateNoteFolderHandler(
    WorkspaceAccessGuard accessGuard,
    INoteFolderRepository noteFolderRepository,
    IUnitOfWork uow) : ICommandHandler<CreateNoteFolderCommand, CreateNoteFolderResult>
{
    public async Task<Result<CreateNoteFolderResult>> Handle(CreateNoteFolderCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<CreateNoteFolderResult>(access.Error);

        var folderResult = NoteFolder.Create(
            WorkspaceId.From(command.WorkspaceId),
            command.Title,
            access.Value.User.Id
        );


        if (folderResult.IsFailure)
            return Result.Failure<CreateNoteFolderResult>(folderResult.Error);

        await noteFolderRepository.AddAsync(folderResult.Value!, ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success(new CreateNoteFolderResult(folderResult.Value!.Id.Value, folderResult.Value.CreatedAt));
    }
}