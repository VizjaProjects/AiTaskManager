package pl.ordovita.tasks.application.port.in;

import java.time.Instant;
import java.util.UUID;

public interface CreateTaskStatusUseCase {

    record CreateTaskStatusCommand(String name, String color) {}
    record CreateTaskStatusResult(UUID statusId, Instant createdAt) {}

    CreateTaskStatusResult createTaskStatus(CreateTaskStatusCommand command);
}
