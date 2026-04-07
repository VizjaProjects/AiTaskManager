package pl.ordovita.tasks.infrastructure.adapter.event;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import pl.ordovita.tasks.domain.model.calendar.CalendarId;
import pl.ordovita.tasks.domain.model.event.Event;
import pl.ordovita.tasks.domain.model.event.EventId;
import pl.ordovita.tasks.domain.model.event.EventStatus;
import pl.ordovita.tasks.domain.model.task.TaskId;
import pl.ordovita.tasks.domain.port.EventRepository;
import pl.ordovita.tasks.infrastructure.jpa.event.EventEntity;
import pl.ordovita.tasks.infrastructure.jpa.event.EventJpaRepository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class EventRepositoryAdapter implements EventRepository {

    private final EventJpaRepository eventJpaRepository;

    @Override
    public Event save(Event event) {
        EventEntity entity = EventEntityMapper.from(event);
        return EventEntityMapper.toDomain(eventJpaRepository.save(entity));
    }

    @Override
    public Optional<Event> findById(EventId id) {
        return eventJpaRepository.findById(id.value()).map(EventEntityMapper::toDomain);
    }

    @Override
    public List<Event> findAllByCalendarId(CalendarId calendarId) {
        return eventJpaRepository.findAllByCalendarId(calendarId.value()).stream().map(EventEntityMapper::toDomain).toList();
    }

    @Override
    public List<Event> findByCalendarIdAndStatus(CalendarId calendarId, EventStatus status) {
        return eventJpaRepository.findByCalendarIdAndStatus(calendarId.value(), status).stream().map(EventEntityMapper::toDomain).toList();
    }

    @Override
    public List<Event> findByTaskId(TaskId taskId) {
        return eventJpaRepository.findByTaskId(taskId.value()).stream().map(EventEntityMapper::toDomain).toList();
    }

    @Override
    public void delete(Event event) {
        eventJpaRepository.delete(EventEntityMapper.from(event));
    }
    @Override
    public Optional<Event> findEventByTaskId(TaskId taskId) {
        return eventJpaRepository.findEventByTaskId(taskId.value()).map(EventEntityMapper::toDomain);
    }
}
