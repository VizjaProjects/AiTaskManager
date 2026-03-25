package pl.ordovita.tasks.application.port.in;

import java.util.UUID;

public interface DeleteTaskUseCase {

    record DeleteTaskCommand(UUID taskId) {}

    void deleteTask(DeleteTaskCommand command);
}
