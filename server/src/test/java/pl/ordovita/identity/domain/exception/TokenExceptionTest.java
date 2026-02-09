package pl.ordovita.identity.domain.exception;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

class TokenExceptionTest {

    @Test
    @DisplayName("Should create token exception with message")
    void shouldCreateTokenExceptionWithMessage() {
        String message = "Invalid token";
        TokenException exception = new TokenException(message);

        assertNotNull(exception);
        assertEquals(message, exception.getMessage());
    }

    @Test
    @DisplayName("Should be throwable")
    void shouldBeThrowable() {
        assertThrows(TokenException.class, () -> {
            throw new TokenException("Test exception");
        });
    }
}
