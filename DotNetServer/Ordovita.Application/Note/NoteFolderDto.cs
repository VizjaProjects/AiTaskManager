namespace Ordovita.Application.Note;

public sealed record NoteFolderDto(
    Guid Id,
    Guid WorkspaceId,
    string NoteTitle,
    string? Description,
    Guid CreatedBy,
    DateTime CreatedAt,
    DateTime UpdatedAt);