namespace Ordovita.Application.Note;

public static class NoteMapper
{
    public static NoteDto ToDto(Domain.Note.Note note)
    {
        return new NoteDto(note.Id.Value, note.WorkspaceId.Value, note.NoteFolderId?.Value, note.Title, note.NoteColor,
            note.Content.RawJson, note.NoteDescription, note.CreatedBy.Value, note.CreatedAt, note.UpdatedAt);
    }

    public static NoteFolderDto ToDto(Domain.Note.NoteFolder folder)
    {
        return new NoteFolderDto(folder.Id.Value, folder.WorkspaceId.Value, folder.NoteTitle, folder.Description,
            folder.CreatedBy.Value, folder.CreatedAt, folder.UpdatedAt);
    }
}