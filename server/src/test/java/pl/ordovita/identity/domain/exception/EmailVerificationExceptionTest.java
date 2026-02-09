package pl.ordovita.identity.domain.exception;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

class EmailVerificationExceptionTest {

    @Test
    @DisplayName("Should create email verification exception with message")
    void shouldCreateEmailVerificationExceptionWithMessage() {
        String message = "Verification code expired";
        EmailVerificationException exception = new EmailVerificationException(message);

        assertNotNull(exception);
        assertEquals(message, exception.getMessage());
    }

    @Test
    @DisplayName("Should be throwable")
    void shouldBeThrowable() {
        assertThrows(EmailVerificationException.class, () -> {
            throw new EmailVerificationException("Test exception");
        });
    }
}
