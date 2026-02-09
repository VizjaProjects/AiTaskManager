package pl.ordovita.identity.domain.model.emailVerification;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import pl.ordovita.identity.domain.exception.EmailVerificationException;
import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.identity.domain.model.user.UserId;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class EmailVerificationTest {

    @Test
    @DisplayName("Should create email verification successfully")
    void shouldCreateEmailVerificationSuccessfully() {
        UserId userId = UserId.generate();
        Email email = new Email("test@example.com");
        String fullName = "John Doe";

        EmailVerification emailVerification = EmailVerification.create(userId, email, fullName);

        assertNotNull(emailVerification);
        assertEquals(userId, emailVerification.getUserId());
        assertEquals(email, emailVerification.getEmail());
        assertNotNull(emailVerification.getCode());
        assertNotNull(emailVerification.getExpiresAt());
        assertFalse(emailVerification.isVerified());
        assertNull(emailVerification.getVerifiedAt());
    }

    @Test
    @DisplayName("Should verify email successfully")
    void shouldVerifyEmailSuccessfully() {
        UserId userId = UserId.generate();
        Email email = new Email("test@example.com");
        VerificationCode code = VerificationCode.generate();
        Instant expiresAt = Instant.now().plusSeconds(900);

        EmailVerification emailVerification = new EmailVerification(
                EmailVerificationId.generate(),
                userId,
                email,
                code,
                expiresAt,
                Instant.now(),
                false,
                null
        );

        emailVerification.verify(code);

        assertTrue(emailVerification.isVerified());
        assertNotNull(emailVerification.getVerifiedAt());
    }

    @Test
    @DisplayName("Should throw exception when already verified")
    void shouldThrowExceptionWhenAlreadyVerified() {
        UserId userId = UserId.generate();
        Email email = new Email("test@example.com");
        VerificationCode code = VerificationCode.generate();
        Instant expiresAt = Instant.now().plusSeconds(900);

        EmailVerification emailVerification = new EmailVerification(
                EmailVerificationId.generate(),
                userId,
                email,
                code,
                expiresAt,
                Instant.now(),
                true,
                Instant.now()
        );

        assertThrows(EmailVerificationException.class, () -> emailVerification.verify(code));
    }

    @Test
    @DisplayName("Should throw exception when verification code is expired")
    void shouldThrowExceptionWhenVerificationCodeIsExpired() {
        UserId userId = UserId.generate();
        Email email = new Email("test@example.com");
        VerificationCode code = VerificationCode.generate();
        Instant expiresAt = Instant.now().minusSeconds(1);

        EmailVerification emailVerification = new EmailVerification(
                EmailVerificationId.generate(),
                userId,
                email,
                code,
                expiresAt,
                Instant.now(),
                false,
                null
        );

        assertThrows(EmailVerificationException.class, () -> emailVerification.verify(code));
    }

    @Test
    @DisplayName("Should throw exception when verification code is invalid")
    void shouldThrowExceptionWhenVerificationCodeIsInvalid() {
        UserId userId = UserId.generate();
        Email email = new Email("test@example.com");
        VerificationCode code = VerificationCode.generate();
        VerificationCode wrongCode = VerificationCode.generate();
        Instant expiresAt = Instant.now().plusSeconds(900);

        EmailVerification emailVerification = new EmailVerification(
                EmailVerificationId.generate(),
                userId,
                email,
                code,
                expiresAt,
                Instant.now(),
                false,
                null
        );

        assertThrows(EmailVerificationException.class, () -> emailVerification.verify(wrongCode));
    }

    @Test
    @DisplayName("Should check if verification is expired")
    void shouldCheckIfVerificationIsExpired() {
        UserId userId = UserId.generate();
        Email email = new Email("test@example.com");
        VerificationCode code = VerificationCode.generate();
        Instant expiresAt = Instant.now().minusSeconds(1);

        EmailVerification emailVerification = new EmailVerification(
                EmailVerificationId.generate(),
                userId,
                email,
                code,
                expiresAt,
                Instant.now(),
                false,
                null
        );

        assertTrue(emailVerification.isExpired());
    }

    @Test
    @DisplayName("Should throw exception when user id is null")
    void shouldThrowExceptionWhenUserIdIsNull() {
        Email email = new Email("test@example.com");
        VerificationCode code = VerificationCode.generate();

        assertThrows(EmailVerificationException.class, () -> new EmailVerification(
                EmailVerificationId.generate(),
                null,
                email,
                code,
                Instant.now().plusSeconds(900),
                Instant.now(),
                false,
                null
        ));
    }

    @Test
    @DisplayName("Should throw exception when email is null")
    void shouldThrowExceptionWhenEmailIsNull() {
        UserId userId = UserId.generate();
        VerificationCode code = VerificationCode.generate();

        assertThrows(EmailVerificationException.class, () -> new EmailVerification(
                EmailVerificationId.generate(),
                userId,
                null,
                code,
                Instant.now().plusSeconds(900),
                Instant.now(),
                false,
                null
        ));
    }
}
