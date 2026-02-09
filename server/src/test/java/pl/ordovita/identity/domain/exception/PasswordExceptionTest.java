package pl.ordovita.identity.domain.exception;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

class PasswordExceptionTest {

    @Test
    @DisplayName("Should create password exception with message")
    void shouldCreatePasswordExceptionWithMessage() {
        String message = "Password too weak";
        PasswordException exception = new PasswordException(message);

        assertNotNull(exception);
        assertEquals(message, exception.getMessage());
    }

    @Test
    @DisplayName("Should be throwable")
    void shouldBeThrowable() {
        assertThrows(PasswordException.class, () -> {
            throw new PasswordException("Test exception");
        });
    }
}
