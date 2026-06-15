namespace Ordovita.Application.Note;

public sealed record NoteDto(
    Guid Id,
    Guid WorkspaceId,
    Guid? NoteFolderId,
    string Title,
    string NoteColor,
    string ContentJson,
    string? NoteDescription,
    IReadOnlyList<Guid> LinkedTaskIds,
    IReadOnlyList<Guid> LinkedEventIds,
    Guid CreatedBy,
    DateTime CreatedAt,
    DateTime UpdatedAt);