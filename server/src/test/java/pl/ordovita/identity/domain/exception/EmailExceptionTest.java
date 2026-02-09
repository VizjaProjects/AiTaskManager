package pl.ordovita.identity.domain.exception;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

class EmailExceptionTest {

    @Test
    @DisplayName("Should create email exception with message")
    void shouldCreateEmailExceptionWithMessage() {
        String message = "Invalid email format";
        EmailException exception = new EmailException(message);

        assertNotNull(exception);
        assertEquals(message, exception.getMessage());
    }

    @Test
    @DisplayName("Should be throwable")
    void shouldBeThrowable() {
        assertThrows(EmailException.class, () -> {
            throw new EmailException("Test exception");
        });
    }
}
