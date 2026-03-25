package pl.ordovita.tasks.application.port.in;

import pl.ordovita.tasks.domain.model.task.TaskPriority;

import java.time.Instant;
import java.util.UUID;

public interface EditTaskUseCase {

    record EditTaskCommand(UUID taskId, String title, String description, TaskPriority priority, UUID categoryId,
                           int estimatedDuration, Instant dueDateTime, UUID statusId) {}
    record EditTaskResult(UUID taskId, Instant updatedAt) {}

    EditTaskResult editTask(EditTaskCommand command);
}
