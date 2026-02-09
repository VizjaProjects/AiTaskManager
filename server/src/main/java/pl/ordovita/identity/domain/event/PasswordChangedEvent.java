package pl.ordovita.identity.domain.event;

import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.shared.domain.event.DomainEvent;

import java.time.Instant;

public record PasswordChangedEvent(Email email, Instant when, String device, String ipAddress) implements DomainEvent {

    @Override
    public Instant getCreatedAt() {
        return when;
    }
}
