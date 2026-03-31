package pl.ordovita.tasks.presentation.dto;

import lombok.NonNull;
import pl.ordovita.tasks.domain.model.event.EventStatus;

import java.time.Instant;

public record AcceptAiEventRequest(@NonNull String title, @NonNull Instant startDateTime,
                                   @NonNull Instant endDateTime, boolean allDay, @NonNull EventStatus status) {
}
