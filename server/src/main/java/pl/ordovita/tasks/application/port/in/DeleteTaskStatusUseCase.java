package pl.ordovita.tasks.application.port.in;

import java.util.UUID;

public interface DeleteTaskStatusUseCase {

    record DeleteTaskStatusCommand(UUID statusId) {}

    void deleteTaskStatus(DeleteTaskStatusCommand command);
}
