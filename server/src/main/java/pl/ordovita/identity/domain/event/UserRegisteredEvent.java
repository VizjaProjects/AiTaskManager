package pl.ordovita.identity.domain.event;

import pl.ordovita.shared.domain.event.DomainEvent;

import java.time.Instant;
import java.util.UUID;

public record UserRegisteredEvent(
        UUID userId,
        String email,
        String fullName,
        Instant occurredAt
) implements DomainEvent {

    public UserRegisteredEvent(UUID userId, String email, String fullName) {
        this(userId, email, fullName, Instant.now());
    }

    @Override
    public Instant getCreatedAt() {
        return occurredAt;
    }
}
