package pl.ordovita.identity.domain.event;

import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.shared.domain.event.DomainEvent;

import java.time.Instant;
import java.util.UUID;

public record RemindPasswordEvent(Email email, UUID token, Instant expiredAt, Instant createdAt, String ipAddress) implements DomainEvent {

    @Override
    public Instant getCreatedAt() {
        return createdAt;
    }
}
