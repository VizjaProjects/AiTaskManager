package pl.ordovita.tasks.application.port.in;

import pl.ordovita.tasks.domain.model.event.EventStatus;

import java.time.Instant;
import java.util.UUID;

public interface AcceptAiEventUseCase {

    record AcceptAiEventCommand(UUID eventId, String title, Instant startDateTime, Instant endDateTime,
                                boolean allDay, EventStatus status) {}

    record AcceptAiEventResult(UUID eventId, Instant updatedAt) {}

    AcceptAiEventResult acceptEvent(AcceptAiEventCommand command);
}
