package pl.ordovita.identity.infrastructure.adapter.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import pl.ordovita.identity.domain.model.user.HashedPassword;
import pl.ordovita.identity.domain.model.user.RawPassword;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BCryptPasswordAdapterTest {

    @Mock
    private PasswordEncoder passwordEncoder;

    private BCryptPasswordAdapter passwordAdapter;

    @BeforeEach
    void setUp() {
        passwordAdapter = new BCryptPasswordAdapter(passwordEncoder);
    }

    @Test
    @DisplayName("Should hash password successfully")
    void shouldHashPasswordSuccessfully() {
        RawPassword rawPassword = new RawPassword("Password123!");
        String hashedValue = "$2a$10$hashedPassword";

        when(passwordEncoder.encode(rawPassword.value())).thenReturn(hashedValue);

        HashedPassword result = passwordAdapter.hash(rawPassword);

        assertNotNull(result);
        assertEquals(hashedValue, result.value());
        verify(passwordEncoder).encode(rawPassword.value());
    }

    @Test
    @DisplayName("Should match passwords correctly")
    void shouldMatchPasswordsCorrectly() {
        RawPassword rawPassword = new RawPassword("Password123!");
        HashedPassword hashedPassword = new HashedPassword("$2a$10$hashedPassword");

        when(passwordEncoder.matches(rawPassword.value(), hashedPassword.value())).thenReturn(true);

        boolean result = passwordAdapter.matches(rawPassword, hashedPassword);

        assertTrue(result);
        verify(passwordEncoder).matches(rawPassword.value(), hashedPassword.value());
    }

    @Test
    @DisplayName("Should not match incorrect passwords")
    void shouldNotMatchIncorrectPasswords() {
        RawPassword rawPassword = new RawPassword("WrongPassword123!");
        HashedPassword hashedPassword = new HashedPassword("$2a$10$hashedPassword");

        when(passwordEncoder.matches(rawPassword.value(), hashedPassword.value())).thenReturn(false);

        boolean result = passwordAdapter.matches(rawPassword, hashedPassword);

        assertFalse(result);
        verify(passwordEncoder).matches(rawPassword.value(), hashedPassword.value());
    }
}
