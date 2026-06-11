namespace Ordovita.Application.Note;

public sealed record NoteDto(
    Guid Id,
    Guid WorkspaceId,
    Guid? NoteFolderId,
    string Title,
    string NoteColor,
    string ContentJson,
    string? NoteDescription,
    Guid CreatedBy,
    DateTime CreatedAt,
    DateTime UpdatedAt);