package pl.ordovita.tasks.application.port.in;

import java.time.Instant;
import java.util.UUID;

public interface EditTaskStatusUseCase {

    record EditTaskStatusCommand(UUID statusId, String name, String color) {}
    record EditTaskStatusResult(UUID statusId, String name, String color, Instant updatedAt) {}

    EditTaskStatusResult editTaskStatus(EditTaskStatusCommand command);
}
