package pl.ordovita.tasks.application.port.in;

import java.util.UUID;

public interface RejectAiTaskUseCase {

    record RejectAiTaskCommand(UUID taskId) {}

    void rejectTask(RejectAiTaskCommand command);
}
