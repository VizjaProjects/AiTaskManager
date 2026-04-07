package pl.ordovita.tasks.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.ordovita.identity.domain.exception.UserException;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.port.CurrentUser;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.tasks.application.port.in.CreateEventUseCase;
import pl.ordovita.tasks.application.port.in.DeleteEventUseCase;
import pl.ordovita.tasks.application.port.in.EditEventUseCase;
import pl.ordovita.tasks.application.port.in.GetUserEventsUseCase;
import pl.ordovita.tasks.domain.exception.CalendarException;
import pl.ordovita.tasks.domain.exception.EventException;
import pl.ordovita.tasks.domain.exception.TaskException;
import pl.ordovita.tasks.domain.model.calendar.Calendar;
import pl.ordovita.tasks.domain.model.event.Event;
import pl.ordovita.tasks.domain.model.event.EventId;
import pl.ordovita.tasks.domain.model.event.EventStatus;
import pl.ordovita.tasks.domain.model.task.Task;
import pl.ordovita.tasks.domain.model.task.TaskId;
import pl.ordovita.tasks.domain.port.CalendarRepository;
import pl.ordovita.tasks.domain.port.EventRepository;
import pl.ordovita.tasks.domain.port.TaskRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService implements CreateEventUseCase, EditEventUseCase, DeleteEventUseCase, GetUserEventsUseCase {

    private final EventRepository eventRepository;
    private final CalendarRepository calendarRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;
    private final TaskRepository taskRepository;

    @Override
    public CreateEventResult createEvent(CreateEventCommand command) {
        User user = userRepository.findById(currentUser.requireAuthenticated().id())
                .orElseThrow(() -> new UserException("User not found"));

        Calendar calendar = calendarRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CalendarException("Calendar not found for user"));

        TaskId taskId = command.taskId() != null ? new TaskId(command.taskId()) : null;

        Event event = Event.create(taskId, command.title(), command.startDateTime(), command.endDateTime(),
                command.allDay(), command.proposedBy(), calendar.getId());

        eventRepository.save(event);

        return new CreateEventResult(event.getId().value(), event.getCreatedAt());
    }

    @Override
    public EditEventResult editEvent(EditEventCommand command) {
        User user = userRepository.findById(currentUser.requireAuthenticated().id())
                .orElseThrow(() -> new UserException("User not found"));

        Calendar calendar = calendarRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CalendarException("Calendar not found for user"));

        EventId eventId = new EventId(command.eventId());
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventException("Event with id " + eventId + " not found"));

        if (!event.getCalendarId().equals(calendar.getId())) {
            throw new EventException("Event does not belong to current user");
        }

        event.edit(command.title(), command.startDateTime(), command.endDateTime(), command.allDay(), command.status());
        Event updatedEvent = eventRepository.save(event);

        return new EditEventResult(updatedEvent.getId().value(), updatedEvent.getUpdatedAt());
    }

    @Override
    public void deleteEvent(DeleteEventCommand command) {
        User user = userRepository.findById(currentUser.requireAuthenticated().id())
                .orElseThrow(() -> new UserException("User not found"));

        Calendar calendar = calendarRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CalendarException("Calendar not found for user"));

        EventId eventId = new EventId(command.eventId());
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventException("Event with id " + eventId + " not found"));

        if(event.getTaskId() != null) {
            Task task = taskRepository.findById(event.getTaskId()).orElseThrow(() -> new TaskException("Task with id " + event.getTaskId() + " not found"));
            task.deleteDueDateTime();
            taskRepository.save(task);
        }

        if (!event.getCalendarId().equals(calendar.getId())) {
            throw new EventException("Event does not belong to current user");
        }

        eventRepository.delete(event);
    }

    @Override
    public GetUserEventsResult getUserEvents() {
        User user = userRepository.findById(currentUser.requireAuthenticated().id())
                .orElseThrow(() -> new UserException("User not found"));

        Calendar calendar = calendarRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CalendarException("Calendar not found for user"));

        List<EventResult> events = eventRepository.findAllByCalendarId(calendar.getId()).stream()
                .filter(e -> e.getStatus() != EventStatus.PROPOSED)
                .map(e -> new EventResult(
                        e.getId().value(),
                        e.getTaskId() != null ? e.getTaskId().value() : null,
                        e.getTitle(),
                        e.getStartDateTime(),
                        e.getEndDateTime(),
                        e.isAllDay(),
                        e.getStatus(),
                        e.getProposedBy(),
                        e.getCalendarId().value(),
                        e.getCreatedAt(),
                        e.getUpdatedAt()
                )).toList();

        return new GetUserEventsResult(events);
    }
}
