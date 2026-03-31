package pl.ordovita.tasks.application.port.in;

import java.util.UUID;

public interface RejectAiEventUseCase {

    record RejectAiEventCommand(UUID eventId) {}

    void rejectEvent(RejectAiEventCommand command);
}
