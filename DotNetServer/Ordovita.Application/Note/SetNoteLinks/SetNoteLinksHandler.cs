using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Tasks;
using Ordovita.Domain.Common;
using Ordovita.Domain.Note;
using Ordovita.Domain.Note.Port;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Note.SetNoteLinks;

public sealed record SetNoteLinksCommand(
    Guid WorkspaceId,
    Guid NoteId,
    IReadOnlyList<Guid> TaskIds,
    IReadOnlyList<Guid> EventIds) : ICommand<Unit>;

public sealed class SetNoteLinksHandler(
    WorkspaceAccessGuard accessGuard,
    INoteRepository noteRepository,
    IWorkTaskRepository taskRepository,
    IWorkCalendarRepository calendarRepository,
    ICalendarEventRepository eventRepository,
    IUnitOfWork uow) : ICommandHandler<SetNoteLinksCommand, Unit>
{
    public async Task<Result<Unit>> Handle(SetNoteLinksCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<Unit>(access.Error);

        var workspaceId = WorkspaceId.From(command.WorkspaceId);

        var note = await noteRepository.GetByIdAsync(NoteId.From(command.NoteId), ct);
        if (note is null || note.WorkspaceId != workspaceId)
            return Result.Failure<Unit>(new Error("Note.NotFound", "Note not found in this workspace."));

        var taskIds = command.TaskIds.Select(TaskId.From).ToHashSet();
        if (taskIds.Count > 0)
        {
            var accepted = await taskRepository.GetAcceptedByWorkspaceIdAsync(workspaceId, ct);
            var validTaskIds = accepted.Select(t => t.Id).ToHashSet();
            if (taskIds.Any(id => !validTaskIds.Contains(id)))
                return Result.Failure<Unit>(new Error("Note.InvalidTaskLink",
                    "One or more tasks do not belong to this workspace."));
        }

        var eventIds = command.EventIds.Select(EventId.From).ToHashSet();
        if (eventIds.Count > 0)
        {
            var calendar = await calendarRepository.GetPrimaryByWorkspaceIdAsync(workspaceId, ct);
            var validEventIds = calendar is null
                ? new HashSet<EventId>()
                : (await eventRepository.GetByCalendarIdAsync(calendar.Id, ct)).Select(e => e.Id).ToHashSet();
            if (eventIds.Any(id => !validEventIds.Contains(id)))
                return Result.Failure<Unit>(new Error("Note.InvalidEventLink",
                    "One or more events do not belong to this workspace."));
        }

        note.SetTaskLinks(taskIds);
        note.SetEventLinks(eventIds);

        await uow.SaveChangesAsync(ct);
        return Result.Success(Unit.Value);
    }
}

public sealed class SetNoteLinksValidator : AbstractValidator<SetNoteLinksCommand>
{
    public SetNoteLinksValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.NoteId).NotEmpty();
        RuleFor(x => x.TaskIds).NotNull();
        RuleFor(x => x.EventIds).NotNull();
    }
}
