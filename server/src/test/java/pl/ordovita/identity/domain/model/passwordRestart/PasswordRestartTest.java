package pl.ordovita.identity.domain.model.passwordRestart;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import pl.ordovita.identity.application.port.out.PasswordHasher;
import pl.ordovita.identity.domain.exception.PasswordRestartException;
import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.identity.domain.model.user.HashedPassword;
import pl.ordovita.identity.domain.model.user.RawPassword;
import pl.ordovita.identity.domain.model.user.UserId;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PasswordRestartTest {

    private final PasswordHasher passwordHasher = mock(PasswordHasher.class);

    @Test
    @DisplayName("Should create password restart successfully")
    void shouldCreatePasswordRestartSuccessfully() {
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");
        UserId userId = UserId.generate();
        Email email = new Email("test@example.com");
        String ipAddress = "192.168.1.1";

        PasswordRestart passwordRestart = PasswordRestart.create(hashedPassword, userId, email, ipAddress);

        assertNotNull(passwordRestart);
        assertNotNull(passwordRestart.getToken());
        assertNotNull(passwordRestart.getExpresAt());
        assertFalse(passwordRestart.isUsed());
    }

    @Test
    @DisplayName("Should check if can restart with valid token")
    void shouldCheckIfCanRestartWithValidToken() {
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");
        UUID token = UUID.randomUUID();
        Instant expiresAt = Instant.now().plusSeconds(900);

        PasswordRestart passwordRestart = new PasswordRestart(
                PasswordRestartId.generate(),
                token,
                expiresAt,
                false,
                hashedPassword,
                Instant.now(),
                Instant.now(),
                UserId.generate()
        );

        assertTrue(passwordRestart.canRestart(token));
    }

    @Test
    @DisplayName("Should return false when restart is already used")
    void shouldReturnFalseWhenRestartIsAlreadyUsed() {
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");
        UUID token = UUID.randomUUID();
        Instant expiresAt = Instant.now().plusSeconds(900);

        PasswordRestart passwordRestart = new PasswordRestart(
                PasswordRestartId.generate(),
                token,
                expiresAt,
                true,
                hashedPassword,
                Instant.now(),
                Instant.now(),
                UserId.generate()
        );

        assertFalse(passwordRestart.canRestart(token));
    }

    @Test
    @DisplayName("Should return false when token is expired")
    void shouldReturnFalseWhenTokenIsExpired() {
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");
        UUID token = UUID.randomUUID();
        Instant expiresAt = Instant.now().minusSeconds(1);

        PasswordRestart passwordRestart = new PasswordRestart(
                PasswordRestartId.generate(),
                token,
                expiresAt,
                false,
                hashedPassword,
                Instant.now(),
                Instant.now(),
                UserId.generate()
        );

        assertFalse(passwordRestart.canRestart(token));
    }

    @Test
    @DisplayName("Should return false when token does not match")
    void shouldReturnFalseWhenTokenDoesNotMatch() {
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");
        UUID token = UUID.randomUUID();
        UUID wrongToken = UUID.randomUUID();
        Instant expiresAt = Instant.now().plusSeconds(900);

        PasswordRestart passwordRestart = new PasswordRestart(
                PasswordRestartId.generate(),
                token,
                expiresAt,
                false,
                hashedPassword,
                Instant.now(),
                Instant.now(),
                UserId.generate()
        );

        assertFalse(passwordRestart.canRestart(wrongToken));
    }

    @Test
    @DisplayName("Should restart password successfully")
    void shouldRestartPasswordSuccessfully() {
        RawPassword newPassword = new RawPassword("NewPassword123!");
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");
        UUID token = UUID.randomUUID();

        when(passwordHasher.matches(newPassword, hashedPassword)).thenReturn(false);

        PasswordRestart passwordRestart = new PasswordRestart(
                PasswordRestartId.generate(),
                token,
                Instant.now().plusSeconds(900),
                false,
                hashedPassword,
                Instant.now(),
                Instant.now(),
                UserId.generate()
        );

        passwordRestart.restart(newPassword, passwordHasher);

        assertTrue(passwordRestart.isUsed());
        assertNotNull(passwordRestart.getUpdatedAt());
    }

    @Test
    @DisplayName("Should throw exception when new password is same as old")
    void shouldThrowExceptionWhenNewPasswordIsSameAsOld() {
        RawPassword newPassword = new RawPassword("Password123!");
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");
        UUID token = UUID.randomUUID();

        when(passwordHasher.matches(newPassword, hashedPassword)).thenReturn(true);

        PasswordRestart passwordRestart = new PasswordRestart(
                PasswordRestartId.generate(),
                token,
                Instant.now().plusSeconds(900),
                false,
                hashedPassword,
                Instant.now(),
                Instant.now(),
                UserId.generate()
        );

        assertThrows(PasswordRestartException.class, () -> passwordRestart.restart(newPassword, passwordHasher));
    }

    @Test
    @DisplayName("Should throw exception when id is null")
    void shouldThrowExceptionWhenIdIsNull() {
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");
        UUID token = UUID.randomUUID();

        assertThrows(PasswordRestartException.class, () -> new PasswordRestart(
                null,
                token,
                Instant.now().plusSeconds(900),
                false,
                hashedPassword,
                Instant.now(),
                Instant.now(),
                UserId.generate()
        ));
    }
}
