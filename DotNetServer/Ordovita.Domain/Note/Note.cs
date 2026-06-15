using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Note.Exception;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Workspace;

namespace Ordovita.Domain.Note;

public class Note : AggregateRoot<NoteId>
{
    private readonly HashSet<NoteTaskLink> _taskLinks = [];
    private readonly HashSet<NoteEventLink> _eventLinks = [];

    public WorkspaceId WorkspaceId { get; private set; }
    public NoteFolderId? NoteFolderId { get; set; }
    public string Title { get; private set; }
    public string NoteColor { get; private set; }
    public NoteContent Content { get; private set; }
    public string? NoteDescription { get; private set; }
    public UserId CreatedBy { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    public IReadOnlyCollection<NoteTaskLink> TaskLinks => _taskLinks;
    public IReadOnlyCollection<NoteEventLink> EventLinks => _eventLinks;
    public IReadOnlyCollection<TaskId> LinkedTaskIds => _taskLinks.Select(l => l.TaskId).ToList();
    public IReadOnlyCollection<EventId> LinkedEventIds => _eventLinks.Select(l => l.EventId).ToList();


    private Note()
    {
    }

    public static Result<Note> Create(WorkspaceId workspaceId, string title, string noteColor,
        NoteContent content, UserId createdBy, NoteFolderId? noteFolderId, string? noteDescription)
    {
        if (string.IsNullOrWhiteSpace(title))
            return Result.Failure<Note>(NoteException.MissingTitle);
        if (string.IsNullOrWhiteSpace(noteColor))
            return Result.Failure<Note>(NoteException.MissingNoteColor);

        var note = new Note
        {
            Id = NoteId.New(),
            WorkspaceId = workspaceId,
            Title = title,
            NoteColor = noteColor,
            Content = content,
            CreatedBy = createdBy,
            NoteFolderId = noteFolderId,
            NoteDescription = noteDescription,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        return Result.Success(note);
    }

    public void UpdateContent(NoteContent newContent)
    {
        Content = newContent;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateMetadata(string title, string noteColor, NoteFolderId? noteFolderId, string noteDescription)
    {
        Title = title;
        NoteColor = noteColor;
        NoteFolderId = noteFolderId;
        UpdatedAt = DateTime.UtcNow;
        NoteDescription = noteDescription;
    }

    public void SetTaskLinks(IEnumerable<TaskId> taskIds)
    {
        var desired = taskIds.ToHashSet();
        _taskLinks.RemoveWhere(l => !desired.Contains(l.TaskId));

        var existing = _taskLinks.Select(l => l.TaskId).ToHashSet();
        foreach (var taskId in desired)
            if (!existing.Contains(taskId))
                _taskLinks.Add(NoteTaskLink.Create(Id, taskId));

        UpdatedAt = DateTime.UtcNow;
    }

    public void SetEventLinks(IEnumerable<EventId> eventIds)
    {
        var desired = eventIds.ToHashSet();
        _eventLinks.RemoveWhere(l => !desired.Contains(l.EventId));

        var existing = _eventLinks.Select(l => l.EventId).ToHashSet();
        foreach (var eventId in desired)
            if (!existing.Contains(eventId))
                _eventLinks.Add(NoteEventLink.Create(Id, eventId));

        UpdatedAt = DateTime.UtcNow;
    }
}