using Ordovita.Domain.Common;

namespace Ordovita.Domain.Note.Exception;

public static class NoteException
{
    public static readonly Error NotFound =
        Error.NotFound("Task.Note", "Note was not found.");

    public static readonly Error MissingTitle =
        Error.Validation("Task.MissingTitle", "Note title is required.");

    public static readonly Error MissingNoteColor =
        Error.Validation("Task.MissingNoteColor", "Note color is required.");

    public static readonly Error MissingContent =
        Error.Validation("Task.MissingContent", "Note content is required.");
}