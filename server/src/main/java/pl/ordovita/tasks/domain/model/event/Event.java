package pl.ordovita.tasks.domain.model.event;

import pl.ordovita.tasks.domain.exception.EventException;
import pl.ordovita.tasks.domain.model.calendar.CalendarId;
import pl.ordovita.tasks.domain.model.task.TaskId;

import java.time.Instant;

public class Event {

    private final EventId id;
    private TaskId taskId;
    private String title;
    private Instant startDateTime;
    private Instant endDateTime;
    private boolean allDay;
    private EventStatus status;
    private ProposedBy proposedBy;
    private final CalendarId calendarId;
    private final Instant createdAt;
    private Instant updatedAt;

    public Event(EventId id, TaskId taskId, String title, Instant startDateTime, Instant endDateTime,
                 boolean allDay, EventStatus status, ProposedBy proposedBy, CalendarId calendarId,
                 Instant createdAt, Instant updatedAt) {
        if (id == null) throw new EventException("Event id cannot be null");
        if (title == null) throw new EventException("Title cannot be null");
        if (startDateTime == null) throw new EventException("Start date time cannot be null");
        if (endDateTime == null) throw new EventException("End date time cannot be null");
        if (status == null) throw new EventException("Status cannot be null");
        if (proposedBy == null) throw new EventException("ProposedBy cannot be null");
        if (calendarId == null) throw new EventException("CalendarId cannot be null");
        if (createdAt == null) throw new EventException("CreatedAt cannot be null");
        if (updatedAt == null) throw new EventException("UpdatedAt cannot be null");
        this.id = id;
        this.taskId = taskId;
        this.title = title;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.allDay = allDay;
        this.status = status;
        this.proposedBy = proposedBy;
        this.calendarId = calendarId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Event create(TaskId taskId, String title, Instant startDateTime, Instant endDateTime,
                               boolean allDay, ProposedBy proposedBy, CalendarId calendarId) {
        return new Event(EventId.generate(), taskId, title, startDateTime, endDateTime, allDay,
                EventStatus.PROPOSED, proposedBy, calendarId, Instant.now(), Instant.now());
    }

    public EventId getId() {
        return id;
    }

    public TaskId getTaskId() {
        return taskId;
    }

    public String getTitle() {
        return title;
    }

    public Instant getStartDateTime() {
        return startDateTime;
    }

    public Instant getEndDateTime() {
        return endDateTime;
    }

    public boolean isAllDay() {
        return allDay;
    }

    public EventStatus getStatus() {
        return status;
    }

    public ProposedBy getProposedBy() {
        return proposedBy;
    }

    public CalendarId getCalendarId() {
        return calendarId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
