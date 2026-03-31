package pl.ordovita.tasks.application.port.in;

import pl.ordovita.tasks.domain.model.task.TaskPriority;

import java.time.Instant;
import java.util.UUID;

public interface AcceptAiTaskUseCase {

    record AcceptAiTaskCommand(UUID taskId, String title, String description, TaskPriority priority,
                               UUID categoryId, int estimatedDuration, Instant dueDateTime, UUID statusId) {}

    record AcceptAiTaskResult(UUID taskId, Instant updatedAt) {}

    AcceptAiTaskResult acceptTask(AcceptAiTaskCommand command);
}
