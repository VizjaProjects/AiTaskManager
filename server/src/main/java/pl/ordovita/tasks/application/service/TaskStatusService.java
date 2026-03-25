package pl.ordovita.tasks.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.ordovita.identity.domain.exception.UserException;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.port.CurrentUser;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.tasks.application.port.in.CreateTaskStatusUseCase;
import pl.ordovita.tasks.application.port.in.DeleteTaskStatusUseCase;
import pl.ordovita.tasks.application.port.in.EditTaskStatusUseCase;
import pl.ordovita.tasks.application.port.in.GetTaskStatusesUseCase;
import pl.ordovita.tasks.domain.exception.TaskStatusException;
import pl.ordovita.tasks.domain.model.status.TaskStatus;
import pl.ordovita.tasks.domain.model.status.TaskStatusId;
import pl.ordovita.tasks.domain.port.TaskStatusRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskStatusService implements CreateTaskStatusUseCase, EditTaskStatusUseCase, DeleteTaskStatusUseCase, GetTaskStatusesUseCase {

    private final TaskStatusRepository taskStatusRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    @Override
    public CreateTaskStatusResult createTaskStatus(CreateTaskStatusCommand command) {
        User user = userRepository.findById(currentUser.requireAuthenticated().id())
                .orElseThrow(() -> new UserException("User not found"));

        TaskStatus status = TaskStatus.create(command.name(), command.color(), user.getId());
        taskStatusRepository.save(status);

        return new CreateTaskStatusResult(status.getId().value(), status.getCreatedAt());
    }

    @Override
    public EditTaskStatusResult editTaskStatus(EditTaskStatusCommand command) {
        User user = userRepository.findById(currentUser.requireAuthenticated().id())
                .orElseThrow(() -> new UserException("User not found"));

        TaskStatusId statusId = new TaskStatusId(command.statusId());
        TaskStatus status = taskStatusRepository.findById(statusId)
                .orElseThrow(() -> new TaskStatusException("TaskStatus with id " + statusId + " not found"));

        if (!status.getUserId().equals(user.getId())) {
            throw new TaskStatusException("TaskStatus does not belong to current user");
        }

        status.edit(command.name(), command.color());
        TaskStatus updatedStatus = taskStatusRepository.save(status);

        return new EditTaskStatusResult(updatedStatus.getId().value(), updatedStatus.getName(),
                updatedStatus.getColor(), updatedStatus.getUpdatedAt());
    }

    @Override
    public void deleteTaskStatus(DeleteTaskStatusCommand command) {
        User user = userRepository.findById(currentUser.requireAuthenticated().id())
                .orElseThrow(() -> new UserException("User not found"));

        TaskStatusId statusId = new TaskStatusId(command.statusId());
        TaskStatus status = taskStatusRepository.findById(statusId)
                .orElseThrow(() -> new TaskStatusException("TaskStatus with id " + statusId + " not found"));

        if (!status.getUserId().equals(user.getId())) {
            throw new TaskStatusException("TaskStatus does not belong to current user");
        }

        taskStatusRepository.delete(status);
    }

    @Override
    public GetAllTaskStatusesResult getAllTaskStatuses() {
        List<TaskStatusResult> statuses = taskStatusRepository.findAll().stream()
                .map(s -> new TaskStatusResult(s.getId().value(), s.getName(), s.getColor(),
                        s.getUserId().value(), s.getCreatedAt(), s.getUpdatedAt()))
                .toList();

        return new GetAllTaskStatusesResult(statuses);
    }

    @Override
    public GetUserTaskStatusesResult getUserTaskStatuses() {
        User user = userRepository.findById(currentUser.requireAuthenticated().id())
                .orElseThrow(() -> new UserException("User not found"));

        List<TaskStatusResult> statuses = taskStatusRepository.findAllByUserId(user.getId()).stream()
                .map(s -> new TaskStatusResult(s.getId().value(), s.getName(), s.getColor(),
                        s.getUserId().value(), s.getCreatedAt(), s.getUpdatedAt()))
                .toList();

        return new GetUserTaskStatusesResult(statuses);
    }
}
