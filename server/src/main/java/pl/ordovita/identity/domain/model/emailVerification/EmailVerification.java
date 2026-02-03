package pl.ordovita.identity.domain.model.emailVerification;

import pl.ordovita.identity.domain.event.EmailVerificationRequestedEvent;
import pl.ordovita.identity.domain.exception.EmailVerificationException;
import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.shared.domain.event.DomainEvent;
import pl.ordovita.shared.domain.event.DomainEventPublisher;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class EmailVerification {

    private static final Duration EXPIRATION_TIME = Duration.ofMinutes(15);


    private final EmailVerificationId id;
    private final UserId userId;
    private final Email email;
    private final VerificationCode code;
    private final Instant expiresAt;
    private final Instant createdAt;
    private boolean verified;
    private Instant verifiedAt;

    private final List<DomainEvent> domainEvents = new ArrayList<>();

    public EmailVerification(EmailVerificationId id, UserId userId, Email email, VerificationCode code, Instant expiresAt, Instant createdAt, boolean verified, Instant verifiedAt) {
        if (id == null) {
            throw new IllegalArgumentException("Email verification id cannot be null");
        }
        if (userId == null) {
            throw new EmailVerificationException("Email verification user id cannot be null");
        }
        if (email == null) {
            throw new EmailVerificationException("Email verification email cannot be null");
        }
        if (code == null) {
            throw new EmailVerificationException("Email verification code cannot be null");
        }
        if (expiresAt == null) {
            throw new EmailVerificationException("Email verification expiresAt cannot be null");
        }
        if (createdAt == null) {
            throw new EmailVerificationException("Email verification createdAt cannot be null");
        }
        this.id = id;
        this.userId = userId;
        this.email = email;
        this.code = code;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
        this.verified = verified;
        this.verifiedAt = verifiedAt;
    }

    public static EmailVerification create(UserId userId, Email email, String fullName) {
        Instant now = Instant.now();

        EmailVerification emailVerification = new EmailVerification(EmailVerificationId.generate(),
                userId,
                email,
                VerificationCode.generate(),
                now.plus(EXPIRATION_TIME),
                now,
                false,
                null);

        emailVerification.registerEvent(new EmailVerificationRequestedEvent(userId.value(),
                email.value(),
                fullName,
                emailVerification.getCode().value(),
                emailVerification.getExpiresAt()));

        return emailVerification;
    }

    public void verify(VerificationCode providedCode) {
        if (verified) {
            throw new EmailVerificationException("Email already verified");
        }

        if (isExpired()) {
            throw new EmailVerificationException("Verification code has expired");
        }

        if (!this.code.equals(providedCode)) {
            throw new EmailVerificationException("Invalid verification code");
        }

        this.verified = true;
        this.verifiedAt = Instant.now();
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }


    public EmailVerificationId getId() {
        return id;
    }

    public UserId getUserId() {
        return userId;
    }

    public Email getEmail() {
        return email;
    }

    public VerificationCode getCode() {
        return code;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public boolean isVerified() {
        return verified;
    }

    public Instant getVerifiedAt() {
        return verifiedAt;
    }

    private void registerEvent(DomainEvent event) {
        this.domainEvents.add(event);
    }

    public List<DomainEvent> getDomainEvents() {
        return List.copyOf(domainEvents);
    }

    public void publish(DomainEventPublisher domainEventPublisher) {
        this.getDomainEvents().forEach(domainEventPublisher::publish);
        this.domainEvents.clear();
    }
}
