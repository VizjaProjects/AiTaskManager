namespace Ordovita.Domain.Note;

public sealed record NoteContent
{
    public string RawJson { get; init; }

    private NoteContent(string rawJson)
    {
        RawJson = rawJson;
    }

    public static NoteContent FromJson(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
            throw new ArgumentException("Note content cannot be null.", nameof(json));

        return new NoteContent(json);
    }
}