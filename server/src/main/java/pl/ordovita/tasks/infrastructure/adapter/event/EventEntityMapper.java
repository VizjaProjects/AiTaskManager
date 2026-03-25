package pl.ordovita.tasks.infrastructure.adapter.event;

import pl.ordovita.tasks.domain.model.calendar.CalendarId;
import pl.ordovita.tasks.domain.model.event.Event;
import pl.ordovita.tasks.domain.model.event.EventId;
import pl.ordovita.tasks.domain.model.task.TaskId;
import pl.ordovita.tasks.infrastructure.jpa.calendar.CalendarEntity;
import pl.ordovita.tasks.infrastructure.jpa.event.EventEntity;
import pl.ordovita.tasks.infrastructure.jpa.task.TaskEntity;

public class EventEntityMapper {

    public static EventEntity from(Event event) {
        TaskEntity taskEntity = null;
        if (event.getTaskId() != null) {
            taskEntity = TaskEntity.builder().id(event.getTaskId().value()).build();
        }

        CalendarEntity calendarEntity = new CalendarEntity();
        calendarEntity.setId(event.getCalendarId().value());

        return new EventEntity(
                event.getId().value(),
                taskEntity,
                event.getTitle(),
                event.getStartDateTime(),
                event.getEndDateTime(),
                event.isAllDay(),
                event.getStatus(),
                event.getProposedBy(),
                calendarEntity,
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }

    public static Event toDomain(EventEntity entity) {
        TaskId taskId = null;
        if (entity.getTaskId() != null) {
            taskId = new TaskId(entity.getTaskId().getId());
        }

        return new Event(
                new EventId(entity.getId()),
                taskId,
                entity.getTitle(),
                entity.getStartDateTime(),
                entity.getEndDateTime(),
                entity.isAllDay(),
                entity.getStatus(),
                entity.getProposedBy(),
                new CalendarId(entity.getCalendarId().getId()),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
