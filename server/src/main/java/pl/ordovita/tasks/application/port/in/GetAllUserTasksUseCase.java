package pl.ordovita.tasks.application.port.in;

import pl.ordovita.tasks.domain.model.task.TaskPriority;
import pl.ordovita.tasks.domain.model.task.TaskSource;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface GetAllUserTasksUseCase {

    record TaskResult(UUID taskId, String title, String description, TaskPriority priority, UUID categoryId,
                      int estimatedDuration, Instant dueDateTime, UUID statusId, TaskSource source,
                      Instant createdAt, Instant updatedAt) {}
    record GetAllUserTasksResult(List<TaskResult> tasks) {}

    GetAllUserTasksResult getAllUserTasks();
}
