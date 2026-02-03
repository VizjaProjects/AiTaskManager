package pl.ordovita.identity.domain.event;

import pl.ordovita.shared.domain.event.DomainEvent;

import java.time.Instant;
import java.util.UUID;

public record EmailVerificationRequestedEvent(
        UUID userId,
        String email,
        String fullName,
        String verificationCode,
        Instant expiresAt,
        Instant occurredAt
) implements DomainEvent {

    public EmailVerificationRequestedEvent(UUID userId, String email, String fullName, String verificationCode, Instant expiresAt) {
        this(userId, email, fullName, verificationCode, expiresAt, Instant.now());
    }

    @Override
    public Instant getCreatedAt() {
        return Instant.now();
    }
}
