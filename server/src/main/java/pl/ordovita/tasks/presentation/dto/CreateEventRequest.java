package pl.ordovita.tasks.presentation.dto;

import lombok.NonNull;
import pl.ordovita.tasks.domain.model.event.ProposedBy;

import java.time.Instant;
import java.util.UUID;

public record CreateEventRequest(@NonNull String title, UUID taskId, @NonNull Instant startDateTime,
                                 @NonNull Instant endDateTime, boolean allDay, @NonNull ProposedBy proposedBy) {
}
