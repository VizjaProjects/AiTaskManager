package pl.ordovita.identity.domain.model.user;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import pl.ordovita.identity.application.port.out.PasswordHasher;
import pl.ordovita.identity.domain.exception.UserException;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserTest {

    private final PasswordHasher passwordHasher = mock(PasswordHasher.class);

    @Test
    @DisplayName("Should create user successfully")
    void shouldCreateUserSuccessfully() {
        Email email = new Email("test@example.com");
        RawPassword rawPassword = new RawPassword("Password123!");
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");

        when(passwordHasher.hash(any(RawPassword.class))).thenReturn(hashedPassword);

        User user = User.createUser("John Doe", email, rawPassword, passwordHasher);

        assertNotNull(user);
        assertEquals("John Doe", user.getFullName());
        assertEquals(email, user.getEmail());
        assertEquals(Role.USER, user.getRole());
        assertFalse(user.isEmailVerified());
        assertFalse(user.isEnabled());
        assertNotNull(user.getId());
    }

    @Test
    @DisplayName("Should verify email successfully")
    void shouldVerifyEmailSuccessfully() {
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");
        User user = new User(
                UserId.generate(),
                "John Doe",
                new Email("test@example.com"),
                Role.USER,
                hashedPassword,
                Instant.now(),
                null,
                null,
                true,
                false,
                null
        );

        user.verifyEmail();

        assertTrue(user.isEmailVerified());
        assertNotNull(user.getEmailVerifiedAt());
        assertNotNull(user.getUpdatedAt());
    }

    @Test
    @DisplayName("Should throw exception when email already verified")
    void shouldThrowExceptionWhenEmailAlreadyVerified() {
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");
        User user = new User(
                UserId.generate(),
                "John Doe",
                new Email("test@example.com"),
                Role.USER,
                hashedPassword,
                Instant.now(),
                Instant.now(),
                null,
                true,
                true,
                Instant.now()
        );

        assertThrows(UserException.class, user::verifyEmail);
    }

    @Test
    @DisplayName("Should return true when user can login")
    void shouldReturnTrueWhenUserCanLogin() {
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");
        User user = new User(
                UserId.generate(),
                "John Doe",
                new Email("test@example.com"),
                Role.USER,
                hashedPassword,
                Instant.now(),
                Instant.now(),
                null,
                true,
                true,
                Instant.now()
        );

        assertTrue(user.canLogin());
    }

    @Test
    @DisplayName("Should return false when user is not enabled")
    void shouldReturnFalseWhenUserIsNotEnabled() {
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");
        User user = new User(
                UserId.generate(),
                "John Doe",
                new Email("test@example.com"),
                Role.USER,
                hashedPassword,
                Instant.now(),
                Instant.now(),
                null,
                false,
                true,
                Instant.now()
        );

        assertFalse(user.canLogin());
    }

    @Test
    @DisplayName("Should return false when email is not verified")
    void shouldReturnFalseWhenEmailIsNotVerified() {
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");
        User user = new User(
                UserId.generate(),
                "John Doe",
                new Email("test@example.com"),
                Role.USER,
                hashedPassword,
                Instant.now(),
                Instant.now(),
                null,
                true,
                false,
                null
        );

        assertFalse(user.canLogin());
    }

    @Test
    @DisplayName("Should update last login time")
    void shouldUpdateLastLoginTime() {
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");
        User user = new User(
                UserId.generate(),
                "John Doe",
                new Email("test@example.com"),
                Role.USER,
                hashedPassword,
                Instant.now(),
                null,
                null,
                true,
                true,
                Instant.now()
        );

        user.login();

        assertNotNull(user.getLastLoginAt());
    }

    @Test
    @DisplayName("Should check if password is correct")
    void shouldCheckIfPasswordIsCorrect() {
        RawPassword rawPassword = new RawPassword("Password123!");
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");

        when(passwordHasher.matches(rawPassword, hashedPassword)).thenReturn(true);

        User user = new User(
                UserId.generate(),
                "John Doe",
                new Email("test@example.com"),
                Role.USER,
                hashedPassword,
                Instant.now(),
                null,
                null,
                true,
                true,
                Instant.now()
        );

        assertTrue(user.isPasswordCorrect(rawPassword, passwordHasher));
    }

    @Test
    @DisplayName("Should change password successfully")
    void shouldChangePasswordSuccessfully() {
        RawPassword oldPassword = new RawPassword("OldPassword123!");
        RawPassword newPassword = new RawPassword("NewPassword123!");
        RawPassword confirmPassword = new RawPassword("NewPassword123!");
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");
        HashedPassword newHashedPassword = new HashedPassword("newHashedPassword");

        when(passwordHasher.hash(newPassword)).thenReturn(newHashedPassword);

        User user = new User(
                UserId.generate(),
                "John Doe",
                new Email("test@example.com"),
                Role.USER,
                hashedPassword,
                Instant.now(),
                null,
                null,
                true,
                true,
                Instant.now()
        );

        user.changePassword(oldPassword, newPassword, confirmPassword, passwordHasher);

        assertEquals(newHashedPassword, user.getHashedPassword());
    }

    @Test
    @DisplayName("Should throw exception when passwords do not match")
    void shouldThrowExceptionWhenPasswordsDoNotMatch() {
        RawPassword oldPassword = new RawPassword("OldPassword123!");
        RawPassword newPassword = new RawPassword("NewPassword123!");
        RawPassword confirmPassword = new RawPassword("DifferentPassword123!");
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");

        User user = new User(
                UserId.generate(),
                "John Doe",
                new Email("test@example.com"),
                Role.USER,
                hashedPassword,
                Instant.now(),
                null,
                null,
                true,
                true,
                Instant.now()
        );

        assertThrows(UserException.class, () -> user.changePassword(oldPassword, newPassword, confirmPassword, passwordHasher));
    }

    @Test
    @DisplayName("Should throw exception when new password is same as old password")
    void shouldThrowExceptionWhenNewPasswordIsSameAsOldPassword() {
        RawPassword oldPassword = new RawPassword("Password123!");
        RawPassword newPassword = new RawPassword("Password123!");
        RawPassword confirmPassword = new RawPassword("Password123!");
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");

        User user = new User(
                UserId.generate(),
                "John Doe",
                new Email("test@example.com"),
                Role.USER,
                hashedPassword,
                Instant.now(),
                null,
                null,
                true,
                true,
                Instant.now()
        );

        assertThrows(UserException.class, () -> user.changePassword(oldPassword, newPassword, confirmPassword, passwordHasher));
    }

    @Test
    @DisplayName("Should change full name successfully")
    void shouldChangeFullNameSuccessfully() {
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");
        User user = new User(
                UserId.generate(),
                "John Doe",
                new Email("test@example.com"),
                Role.USER,
                hashedPassword,
                Instant.now(),
                null,
                null,
                true,
                true,
                Instant.now()
        );

        user.changeFullName("Jane Doe");

        assertEquals("Jane Doe", user.getFullName());
    }

    @Test
    @DisplayName("Should throw exception when new full name is same as old")
    void shouldThrowExceptionWhenNewFullNameIsSameAsOld() {
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");
        User user = new User(
                UserId.generate(),
                "John Doe",
                new Email("test@example.com"),
                Role.USER,
                hashedPassword,
                Instant.now(),
                null,
                null,
                true,
                true,
                Instant.now()
        );

        assertThrows(UserException.class, () -> user.changeFullName("John Doe"));
    }

    @Test
    @DisplayName("Should remind password successfully")
    void shouldRemindPasswordSuccessfully() {
        RawPassword newPassword = new RawPassword("NewPassword123!");
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");
        HashedPassword newHashedPassword = new HashedPassword("newHashedPassword");

        when(passwordHasher.hash(newPassword)).thenReturn(newHashedPassword);

        User user = new User(
                UserId.generate(),
                "John Doe",
                new Email("test@example.com"),
                Role.USER,
                hashedPassword,
                Instant.now(),
                null,
                null,
                true,
                true,
                Instant.now()
        );

        user.remindPassword(newPassword, passwordHasher);

        assertEquals(newHashedPassword, user.getHashedPassword());
    }

    @Test
    @DisplayName("Should throw exception when account is disabled during password remind")
    void shouldThrowExceptionWhenAccountIsDisabledDuringPasswordRemind() {
        RawPassword newPassword = new RawPassword("NewPassword123!");
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");

        User user = new User(
                UserId.generate(),
                "John Doe",
                new Email("test@example.com"),
                Role.USER,
                hashedPassword,
                Instant.now(),
                null,
                null,
                false,
                true,
                Instant.now()
        );

        assertThrows(UserException.class, () -> user.remindPassword(newPassword, passwordHasher));
    }

    @Test
    @DisplayName("Should update user data updated timestamp")
    void shouldUpdateUserDataUpdatedTimestamp() {
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");
        User user = new User(
                UserId.generate(),
                "John Doe",
                new Email("test@example.com"),
                Role.USER,
                hashedPassword,
                Instant.now(),
                null,
                null,
                true,
                true,
                Instant.now()
        );

        user.userDataUpdated();

        assertNotNull(user.getUpdatedAt());
    }
}
