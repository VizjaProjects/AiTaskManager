package pl.ordovita.identity.domain.model.user;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import pl.ordovita.identity.domain.exception.PasswordException;

import static org.junit.jupiter.api.Assertions.*;

class RawPasswordTest {

    @Test
    @DisplayName("Should create valid password")
    void shouldCreateValidPassword() {
        RawPassword password = new RawPassword("Password123!");
        
        assertEquals("Password123!", password.value());
    }

    @Test
    @DisplayName("Should throw exception when password is null")
    void shouldThrowExceptionWhenPasswordIsNull() {
        assertThrows(PasswordException.class, () -> new RawPassword(null));
    }

    @Test
    @DisplayName("Should throw exception when password is empty")
    void shouldThrowExceptionWhenPasswordIsEmpty() {
        assertThrows(PasswordException.class, () -> new RawPassword(""));
    }

    @Test
    @DisplayName("Should throw exception when password is too short")
    void shouldThrowExceptionWhenPasswordIsTooShort() {
        assertThrows(PasswordException.class, () -> new RawPassword("Pass1!"));
    }

    @Test
    @DisplayName("Should throw exception when password has no uppercase letter")
    void shouldThrowExceptionWhenPasswordHasNoUppercaseLetter() {
        assertThrows(PasswordException.class, () -> new RawPassword("password123!"));
    }

    @Test
    @DisplayName("Should throw exception when password has no lowercase letter")
    void shouldThrowExceptionWhenPasswordHasNoLowercaseLetter() {
        assertThrows(PasswordException.class, () -> new RawPassword("PASSWORD123!"));
    }

    @Test
    @DisplayName("Should throw exception when password has no digit")
    void shouldThrowExceptionWhenPasswordHasNoDigit() {
        assertThrows(PasswordException.class, () -> new RawPassword("Password!"));
    }

    @Test
    @DisplayName("Should throw exception when password has no special character")
    void shouldThrowExceptionWhenPasswordHasNoSpecialCharacter() {
        assertThrows(PasswordException.class, () -> new RawPassword("Password123"));
    }

    @Test
    @DisplayName("Should accept valid password")
    void shouldAcceptValidPassword() {
        assertDoesNotThrow(() -> new RawPassword("Password123!"));
        assertDoesNotThrow(() -> new RawPassword("MySecure@Pass1"));
        assertDoesNotThrow(() -> new RawPassword("Complex#Pass123"));
    }
}
