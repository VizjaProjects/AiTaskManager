package pl.ordovita.identity.domain.event;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import pl.ordovita.identity.domain.model.user.Email;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class PasswordChangedEventTest {

    @Test
    @DisplayName("Should create password changed event")
    void shouldCreatePasswordChangedEvent() {
        Email email = new Email("test@example.com");
        Instant when = Instant.now();
        String device = "Chrome on Windows";
        String ipAddress = "192.168.1.1";

        PasswordChangedEvent event = new PasswordChangedEvent(email, when, device, ipAddress);

        assertNotNull(event);
        assertEquals(email, event.email());
        assertEquals(when, event.when());
        assertEquals(device, event.device());
        assertEquals(ipAddress, event.ipAddress());
    }

    @Test
    @DisplayName("Should have all required fields")
    void shouldHaveAllRequiredFields() {
        PasswordChangedEvent event = new PasswordChangedEvent(
                new Email("test@example.com"),
                Instant.now(),
                "Chrome on Windows",
                "192.168.1.1"
        );

        assertNotNull(event.email());
        assertNotNull(event.when());
        assertNotNull(event.device());
        assertNotNull(event.ipAddress());
    }
}
