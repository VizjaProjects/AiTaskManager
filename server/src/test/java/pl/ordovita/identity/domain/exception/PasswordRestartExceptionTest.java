package pl.ordovita.identity.domain.exception;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

class PasswordRestartExceptionTest {

    @Test
    @DisplayName("Should create password restart exception with message")
    void shouldCreatePasswordRestartExceptionWithMessage() {
        String message = "Password restart token expired";
        PasswordRestartException exception = new PasswordRestartException(message);

        assertNotNull(exception);
        assertEquals(message, exception.getMessage());
    }

    @Test
    @DisplayName("Should be throwable")
    void shouldBeThrowable() {
        assertThrows(PasswordRestartException.class, () -> {
            throw new PasswordRestartException("Test exception");
        });
    }
}
