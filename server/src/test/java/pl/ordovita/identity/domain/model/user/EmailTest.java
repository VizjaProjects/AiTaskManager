package pl.ordovita.identity.domain.model.user;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import pl.ordovita.identity.domain.exception.EmailException;

import static org.junit.jupiter.api.Assertions.*;

class EmailTest {

    @Test
    @DisplayName("Should create valid email")
    void shouldCreateValidEmail() {
        Email email = new Email("test@example.com");
        
        assertEquals("test@example.com", email.value());
    }

    @Test
    @DisplayName("Should throw exception when email is null")
    void shouldThrowExceptionWhenEmailIsNull() {
        assertThrows(EmailException.class, () -> new Email(null));
    }

    @Test
    @DisplayName("Should throw exception when email is blank")
    void shouldThrowExceptionWhenEmailIsBlank() {
        assertThrows(EmailException.class, () -> new Email(""));
        assertThrows(EmailException.class, () -> new Email("   "));
    }

    @Test
    @DisplayName("Should throw exception when email is invalid")
    void shouldThrowExceptionWhenEmailIsInvalid() {
        assertThrows(EmailException.class, () -> new Email("invalid-email"));
        assertThrows(EmailException.class, () -> new Email("@example.com"));
        assertThrows(EmailException.class, () -> new Email("test@"));
        assertThrows(EmailException.class, () -> new Email("test.example.com"));
    }

    @Test
    @DisplayName("Should accept valid email formats")
    void shouldAcceptValidEmailFormats() {
        assertDoesNotThrow(() -> new Email("test@example.com"));
        assertDoesNotThrow(() -> new Email("user.name@example.com"));
        assertDoesNotThrow(() -> new Email("user_name@example.co.uk"));
        assertDoesNotThrow(() -> new Email("user-name@example.org"));
    }
}
