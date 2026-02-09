package pl.ordovita.identity.domain.exception;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

class UserExceptionTest {

    @Test
    @DisplayName("Should create user exception with message")
    void shouldCreateUserExceptionWithMessage() {
        String message = "User not found";
        UserException exception = new UserException(message);

        assertNotNull(exception);
        assertEquals(message, exception.getMessage());
    }

    @Test
    @DisplayName("Should be throwable")
    void shouldBeThrowable() {
        assertThrows(UserException.class, () -> {
            throw new UserException("Test exception");
        });
    }
}
