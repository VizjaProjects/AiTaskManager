package pl.ordovita.identity.domain.event;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import pl.ordovita.identity.domain.model.user.Email;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class RemindPasswordEventTest {

    @Test
    @DisplayName("Should create remind password event")
    void shouldCreateRemindPasswordEvent() {
        Email email = new Email("test@example.com");
        UUID token = UUID.randomUUID();
        Instant expiresAt = Instant.now().plusSeconds(900);
        Instant createdAt = Instant.now();
        String ipAddress = "192.168.1.1";

        RemindPasswordEvent event = new RemindPasswordEvent(email, token, expiresAt, createdAt, ipAddress);

        assertNotNull(event);
        assertEquals(email, event.email());
        assertEquals(token, event.token());
        assertEquals(expiresAt, event.expiredAt());
        assertEquals(createdAt, event.createdAt());
        assertEquals(ipAddress, event.ipAddress());
    }

    @Test
    @DisplayName("Should have all required fields")
    void shouldHaveAllRequiredFields() {
        RemindPasswordEvent event = new RemindPasswordEvent(
                new Email("test@example.com"),
                UUID.randomUUID(),
                Instant.now().plusSeconds(900),
                Instant.now(),
                "192.168.1.1"
        );

        assertNotNull(event.email());
        assertNotNull(event.token());
        assertNotNull(event.expiredAt());
        assertNotNull(event.createdAt());
        assertNotNull(event.ipAddress());
    }
}
