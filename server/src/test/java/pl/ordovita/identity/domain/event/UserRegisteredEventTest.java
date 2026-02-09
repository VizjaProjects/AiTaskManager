package pl.ordovita.identity.domain.event;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class UserRegisteredEventTest {

    @Test
    @DisplayName("Should create user registered event")
    void shouldCreateUserRegisteredEvent() {
        UUID userId = UUID.randomUUID();
        String email = "test@example.com";
        String fullName = "Test User";

        UserRegisteredEvent event = new UserRegisteredEvent(userId, email, fullName);

        assertNotNull(event);
        assertEquals(userId, event.userId());
        assertEquals(email, event.email());
        assertEquals(fullName, event.fullName());
    }

    @Test
    @DisplayName("Should have all required fields")
    void shouldHaveAllRequiredFields() {
        UUID userId = UUID.randomUUID();
        UserRegisteredEvent event = new UserRegisteredEvent(userId, "test@example.com", "Test User");

        assertNotNull(event.userId());
        assertNotNull(event.email());
        assertNotNull(event.fullName());
    }
}
