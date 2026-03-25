package pl.ordovita.tasks.application.port.in;

import pl.ordovita.tasks.domain.model.task.TaskPriority;
import pl.ordovita.tasks.domain.model.task.TaskSource;

import java.time.Instant;
import java.util.UUID;

public interface CreateTaskUseCase {

    record CreateTaskCommand(String title, String description, TaskPriority priority, UUID categoryId,
                             int estimatedDuration, Instant dueDateTime, UUID statusId, TaskSource source) {}
    record CreateTaskResult(UUID taskId, Instant createdAt) {}

    CreateTaskResult createTask(CreateTaskCommand command);
}
