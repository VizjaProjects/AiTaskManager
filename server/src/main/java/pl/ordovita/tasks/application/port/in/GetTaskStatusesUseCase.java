package pl.ordovita.tasks.application.port.in;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface GetTaskStatusesUseCase {

    record TaskStatusResult(UUID statusId, String name, String color, UUID userId, Instant createdAt, Instant updatedAt) {}
    record GetAllTaskStatusesResult(List<TaskStatusResult> statuses) {}
    record GetUserTaskStatusesResult(List<TaskStatusResult> statuses) {}

    GetAllTaskStatusesResult getAllTaskStatuses();
    GetUserTaskStatusesResult getUserTaskStatuses();
}
