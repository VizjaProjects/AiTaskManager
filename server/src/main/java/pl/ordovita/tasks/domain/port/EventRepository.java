package pl.ordovita.tasks.domain.port;

import pl.ordovita.tasks.domain.model.calendar.CalendarId;
import pl.ordovita.tasks.domain.model.event.Event;
import pl.ordovita.tasks.domain.model.event.EventId;

import pl.ordovita.tasks.domain.model.event.EventStatus;
import pl.ordovita.tasks.domain.model.task.TaskId;

import java.util.List;
import java.util.Optional;

public interface EventRepository {
    Event save(Event event);
    Optional<Event> findById(EventId id);
    List<Event> findAllByCalendarId(CalendarId calendarId);
    List<Event> findByCalendarIdAndStatus(CalendarId calendarId, EventStatus status);
    Optional<Event> findByTaskId(TaskId taskId);
    void delete(Event event);
}
