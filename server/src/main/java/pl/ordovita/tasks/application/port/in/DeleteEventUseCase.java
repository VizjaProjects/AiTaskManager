package pl.ordovita.tasks.application.port.in;

import java.util.UUID;

public interface DeleteEventUseCase {

    record DeleteEventCommand(UUID eventId) {}

    void deleteEvent(DeleteEventCommand command);
}
