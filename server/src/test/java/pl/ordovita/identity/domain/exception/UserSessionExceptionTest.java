package pl.ordovita.identity.domain.exception;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

class UserSessionExceptionTest {

    @Test
    @DisplayName("Should create user session exception with message")
    void shouldCreateUserSessionExceptionWithMessage() {
        String message = "Session not found";
        UserSessionException exception = new UserSessionException(message);

        assertNotNull(exception);
        assertEquals(message, exception.getMessage());
    }

    @Test
    @DisplayName("Should be throwable")
    void shouldBeThrowable() {
        assertThrows(UserSessionException.class, () -> {
            throw new UserSessionException("Test exception");
        });
    }
}
