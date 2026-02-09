package pl.ordovita.identity.domain.model.user;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import pl.ordovita.identity.application.port.out.PasswordHasher;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class HashedPasswordTest {

    @Test
    @DisplayName("Should create hashed password")
    void shouldCreateHashedPassword() {
        HashedPassword hashedPassword = new HashedPassword("hashedValue");
        
        assertEquals("hashedValue", hashedPassword.value());
    }

    @Test
    @DisplayName("Should match raw password correctly")
    void shouldMatchRawPasswordCorrectly() {
        HashedPassword hashedPassword = new HashedPassword("hashedValue");
        RawPassword rawPassword = new RawPassword("Password123!");
        PasswordHasher hasher = mock(PasswordHasher.class);

        when(hasher.matches(rawPassword, hashedPassword)).thenReturn(true);

        assertTrue(hashedPassword.matchesRaw(rawPassword, hasher));
        verify(hasher).matches(rawPassword, hashedPassword);
    }

    @Test
    @DisplayName("Should not match incorrect raw password")
    void shouldNotMatchIncorrectRawPassword() {
        HashedPassword hashedPassword = new HashedPassword("hashedValue");
        RawPassword rawPassword = new RawPassword("WrongPassword123!");
        PasswordHasher hasher = mock(PasswordHasher.class);

        when(hasher.matches(rawPassword, hashedPassword)).thenReturn(false);

        assertFalse(hashedPassword.matchesRaw(rawPassword, hasher));
        verify(hasher).matches(rawPassword, hashedPassword);
    }
}
