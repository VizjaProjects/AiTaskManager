package pl.ordovita.tasks.application.port.in;

import pl.ordovita.tasks.domain.model.event.EventStatus;

import java.time.Instant;
import java.util.UUID;

public interface EditEventUseCase {

    record EditEventCommand(UUID eventId, String title, Instant startDateTime, Instant endDateTime,
                            boolean allDay, EventStatus status) {}
    record EditEventResult(UUID eventId, Instant updatedAt) {}

    EditEventResult editEvent(EditEventCommand command);
}
