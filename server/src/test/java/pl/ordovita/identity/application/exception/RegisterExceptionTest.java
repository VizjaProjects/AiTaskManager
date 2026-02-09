package pl.ordovita.identity.application.exception;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

class RegisterExceptionTest {

    @Test
    @DisplayName("Should create register exception with message")
    void shouldCreateRegisterExceptionWithMessage() {
        String message = "Email already exists";
        RegisterException exception = new RegisterException(message);

        assertNotNull(exception);
        assertEquals(message, exception.getMessage());
    }

    @Test
    @DisplayName("Should be throwable")
    void shouldBeThrowable() {
        assertThrows(RegisterException.class, () -> {
            throw new RegisterException("Test exception");
        });
    }
}
