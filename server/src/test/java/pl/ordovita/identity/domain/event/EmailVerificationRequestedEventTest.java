package pl.ordovita.identity.domain.event;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class EmailVerificationRequestedEventTest {

    @Test
    @DisplayName("Should create email verification requested event")
    void shouldCreateEmailVerificationRequestedEvent() {
        UUID userId = UUID.randomUUID();
        String email = "test@example.com";
        String fullName = "Test User";
        String verificationCode = "123456";
        Instant expiresAt = Instant.now().plusSeconds(900);

        EmailVerificationRequestedEvent event = new EmailVerificationRequestedEvent(
                userId,
                email,
                fullName,
                verificationCode,
                expiresAt
        );

        assertNotNull(event);
        assertEquals(userId, event.userId());
        assertEquals(email, event.email());
        assertEquals(fullName, event.fullName());
        assertEquals(verificationCode, event.verificationCode());
        assertEquals(expiresAt, event.expiresAt());
    }

    @Test
    @DisplayName("Should have all required fields")
    void shouldHaveAllRequiredFields() {
        EmailVerificationRequestedEvent event = new EmailVerificationRequestedEvent(
                UUID.randomUUID(),
                "test@example.com",
                "Test User",
                "123456",
                Instant.now()
        );

        assertNotNull(event.userId());
        assertNotNull(event.email());
        assertNotNull(event.fullName());
        assertNotNull(event.verificationCode());
        assertNotNull(event.getCreatedAt());
    }
}
