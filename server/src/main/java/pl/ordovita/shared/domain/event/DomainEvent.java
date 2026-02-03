package pl.ordovita.shared.domain.event;

import java.time.Instant;

public interface DomainEvent {
    Instant getCreatedAt();

    default String getType() {
        return getClass().getSimpleName();
    }
}
