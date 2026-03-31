package pl.ordovita.tasks.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.ordovita.identity.domain.exception.UserException;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.port.CurrentUser;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.tasks.application.port.in.AcceptAiEventUseCase;
import pl.ordovita.tasks.application.port.in.AcceptAiTaskUseCase;
import pl.ordovita.tasks.application.port.in.GetPendingAiProposalsUseCase;
import pl.ordovita.tasks.application.port.in.RejectAiEventUseCase;
import pl.ordovita.tasks.application.port.in.RejectAiTaskUseCase;
import pl.ordovita.tasks.domain.exception.CalendarException;
import pl.ordovita.tasks.domain.exception.EventException;
import pl.ordovita.tasks.domain.exception.TaskException;
import pl.ordovita.tasks.domain.model.calendar.Calendar;
import pl.ordovita.tasks.domain.model.category.CategoryId;
import pl.ordovita.tasks.domain.model.event.Event;
import pl.ordovita.tasks.domain.model.event.EventId;
import pl.ordovita.tasks.domain.model.event.EventStatus;
import pl.ordovita.tasks.domain.model.status.TaskStatusId;
import pl.ordovita.tasks.domain.model.task.Task;
import pl.ordovita.tasks.domain.model.task.TaskId;
import pl.ordovita.tasks.domain.port.CalendarRepository;
import pl.ordovita.tasks.domain.port.EventRepository;
import pl.ordovita.tasks.domain.port.TaskRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiProposalService implements GetPendingAiProposalsUseCase, AcceptAiTaskUseCase,
        RejectAiTaskUseCase, AcceptAiEventUseCase, RejectAiEventUseCase {

    private final TaskRepository taskRepository;
    private final EventRepository eventRepository;
    private final CalendarRepository calendarRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    @Override
    public GetPendingAiProposalsResult getPendingProposals() {
        User user = requireUser();

        List<PendingTask> pendingTasks = taskRepository.findPendingByUserId(user.getId()).stream()
                .map(t -> new PendingTask(t.getId().value(), t.getTitle(), t.getDescription(),
                        t.getPriority(), t.getCategoryId() != null ? t.getCategoryId().value() : null,
                        t.getEstimatedDuration(), t.getDueDateTime(), t.getStatusId().value(),
                        t.getSource(), t.getCreatedAt()))
                .toList();

        Calendar calendar = calendarRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CalendarException("Calendar not found for user"));

        List<PendingEvent> pendingEvents = eventRepository.findByCalendarIdAndStatus(
                calendar.getId(), EventStatus.PROPOSED).stream()
                .map(e -> new PendingEvent(e.getId().value(),
                        e.getTaskId() != null ? e.getTaskId().value() : null,
                        e.getTitle(), e.getStartDateTime(), e.getEndDateTime(),
                        e.isAllDay(), e.getProposedBy(), e.getCreatedAt()))
                .toList();

        return new GetPendingAiProposalsResult(pendingTasks, pendingEvents);
    }

    @Override
    public AcceptAiTaskResult acceptTask(AcceptAiTaskCommand command) {
        User user = requireUser();
        TaskId taskId = new TaskId(command.taskId());

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskException("Task with id " + taskId + " not found"));

        if (!task.getUserId().equals(user.getId())) {
            throw new TaskException("Task does not belong to current user");
        }

        CategoryId categoryId = command.categoryId() != null ? new CategoryId(command.categoryId()) : null;
        TaskStatusId statusId = new TaskStatusId(command.statusId());

        task.edit(command.title(), command.description(), command.priority(), categoryId,
                command.estimatedDuration(), command.dueDateTime(), statusId);
        task.accept();

        Task saved = taskRepository.save(task);

        eventRepository.findByTaskId(taskId).ifPresent(event -> {
            event.accept();
            eventRepository.save(event);
        });

        return new AcceptAiTaskResult(saved.getId().value(), saved.getUpdatedAt());
    }

    @Override
    public void rejectTask(RejectAiTaskCommand command) {
        User user = requireUser();
        TaskId taskId = new TaskId(command.taskId());

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskException("Task with id " + taskId + " not found"));

        if (!task.getUserId().equals(user.getId())) {
            throw new TaskException("Task does not belong to current user");
        }

        eventRepository.findByTaskId(taskId).ifPresent(eventRepository::delete);
        taskRepository.delete(task);
    }

    @Override
    public AcceptAiEventResult acceptEvent(AcceptAiEventCommand command) {
        User user = requireUser();
        EventId eventId = new EventId(command.eventId());

        Calendar calendar = calendarRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CalendarException("Calendar not found for user"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventException("Event with id " + eventId + " not found"));

        if (!event.getCalendarId().equals(calendar.getId())) {
            throw new EventException("Event does not belong to current user");
        }

        event.edit(command.title(), command.startDateTime(), command.endDateTime(),
                command.allDay(), EventStatus.ACCEPTED);

        Event saved = eventRepository.save(event);

        return new AcceptAiEventResult(saved.getId().value(), saved.getUpdatedAt());
    }

    @Override
    public void rejectEvent(RejectAiEventCommand command) {
        User user = requireUser();
        EventId eventId = new EventId(command.eventId());

        Calendar calendar = calendarRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CalendarException("Calendar not found for user"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventException("Event with id " + eventId + " not found"));

        if (!event.getCalendarId().equals(calendar.getId())) {
            throw new EventException("Event does not belong to current user");
        }

        eventRepository.delete(event);
    }

    private User requireUser() {
        return userRepository.findById(currentUser.requireAuthenticated().id())
                .orElseThrow(() -> new UserException("User not found"));
    }
}
