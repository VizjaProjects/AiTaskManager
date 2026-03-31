package pl.ordovita.tasks.application.port.in;

import pl.ordovita.tasks.domain.model.event.ProposedBy;

import java.time.Instant;
import java.util.UUID;

public interface CreateEventUseCase {

    record CreateEventCommand(UUID taskId, String title, Instant startDateTime, Instant endDateTime,
                              boolean allDay, ProposedBy proposedBy) {}
    record CreateEventResult(UUID eventId, Instant createdAt) {}

    CreateEventResult createEvent(CreateEventCommand command);
}
