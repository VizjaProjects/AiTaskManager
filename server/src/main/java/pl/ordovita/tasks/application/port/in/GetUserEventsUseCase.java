package pl.ordovita.tasks.application.port.in;

import pl.ordovita.tasks.domain.model.event.EventStatus;
import pl.ordovita.tasks.domain.model.event.ProposedBy;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface GetUserEventsUseCase {

    record EventResult(UUID eventId, UUID taskId, String title, Instant startDateTime, Instant endDateTime,
                       boolean allDay, EventStatus status, ProposedBy proposedBy, UUID calendarId,
                       Instant createdAt, Instant updatedAt) {}
    record GetUserEventsResult(List<EventResult> events) {}

    GetUserEventsResult getUserEvents();
}
