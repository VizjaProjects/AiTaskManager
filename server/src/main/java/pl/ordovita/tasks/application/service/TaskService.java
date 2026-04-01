package pl.ordovita.tasks.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.ordovita.identity.domain.exception.UserException;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.port.CurrentUser;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.tasks.application.port.in.CreateTaskUseCase;
import pl.ordovita.tasks.application.port.in.DeleteTaskUseCase;
import pl.ordovita.tasks.application.port.in.EditTaskUseCase;
import pl.ordovita.tasks.application.port.in.GetAllUserTasksUseCase;
import pl.ordovita.tasks.domain.exception.CalendarException;
import pl.ordovita.tasks.domain.exception.TaskException;
import pl.ordovita.tasks.domain.model.calendar.Calendar;
import pl.ordovita.tasks.domain.model.category.CategoryId;
import pl.ordovita.tasks.domain.model.event.Event;
import pl.ordovita.tasks.domain.model.event.ProposedBy;
import pl.ordovita.tasks.domain.model.status.TaskStatusId;
import pl.ordovita.tasks.domain.model.task.Task;
import pl.ordovita.tasks.domain.model.task.TaskId;
import pl.ordovita.tasks.domain.port.CalendarRepository;
import pl.ordovita.tasks.domain.port.EventRepository;
import pl.ordovita.tasks.domain.port.TaskRepository;

import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService implements CreateTaskUseCase, EditTaskUseCase, DeleteTaskUseCase, GetAllUserTasksUseCase {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;
    private final CalendarRepository calendarRepository;
    private final EventRepository eventRepository;

    @Override
    public CreateTaskResult createTask(CreateTaskCommand command) {
        User user = userRepository.findById(currentUser.requireAuthenticated().id())
                .orElseThrow(() -> new UserException("User not found"));

        CategoryId categoryId = command.categoryId() != null ? new CategoryId(command.categoryId()) : null;
        TaskStatusId statusId = new TaskStatusId(command.statusId());

        Task task = Task.create(command.title(), command.description(), command.priority(), categoryId,
                command.estimatedDuration(), command.dueDateTime(), statusId, command.source(), user.getId());

        taskRepository.save(task);

        if (command.dueDateTime() != null) {
            Calendar calendar = calendarRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new CalendarException("Calendar not found for user"));

            Event event = Event.create(task.getId(), task.getTitle(), command.dueDateTime(),
                    command.dueDateTime().plus(Duration.ofMinutes(command.estimatedDuration())),
                    false, ProposedBy.USER, calendar.getId());

            eventRepository.save(event);
        }

        return new CreateTaskResult(task.getId().value(), task.getCreatedAt());
    }

    @Override
    public EditTaskResult editTask(EditTaskCommand command) {
        User user = userRepository.findById(currentUser.requireAuthenticated().id())
                .orElseThrow(() -> new UserException("User not found"));

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


        Task updatedTask = taskRepository.save(task);

        if(command.dueDateTime() != null) {
            Calendar calendar = calendarRepository.findByUserId(user.getId()).orElseThrow(() -> new CalendarException("Calendar not found for user"));

            Event event = Event.create(taskId,task.getTitle(),(command.dueDateTime().minusSeconds(command.estimatedDuration() * 60L)), command.dueDateTime(), false, ProposedBy.USER, calendar.getId());
            eventRepository.save(event);


        }

        return new EditTaskResult(updatedTask.getId().value(), updatedTask.getUpdatedAt());
    }

    @Override
    public void deleteTask(DeleteTaskCommand command) {
        User user = userRepository.findById(currentUser.requireAuthenticated().id())
                .orElseThrow(() -> new UserException("User not found"));

        TaskId taskId = new TaskId(command.taskId());
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskException("Task with id " + taskId + " not found"));

        if (!task.getUserId().equals(user.getId())) {
            throw new TaskException("Task does not belong to current user");
        }

        taskRepository.delete(task);
    }

    @Override
    public GetAllUserTasksResult getAllUserTasks() {
        User user = userRepository.findById(currentUser.requireAuthenticated().id())
                .orElseThrow(() -> new UserException("User not found"));

        List<TaskResult> tasks = taskRepository.findAcceptedByUserId(user.getId()).stream()
                .map(task -> new TaskResult(
                        task.getId().value(),
                        task.getTitle(),
                        task.getDescription(),
                        task.getPriority(),
                        task.getCategoryId() != null ? task.getCategoryId().value() : null,
                        task.getEstimatedDuration(),
                        task.getDueDateTime(),
                        task.getStatusId().value(),
                        task.getSource(),
                        task.getCreatedAt(),
                        task.getUpdatedAt()
                )).toList();

        return new GetAllUserTasksResult(tasks);
    }
}
