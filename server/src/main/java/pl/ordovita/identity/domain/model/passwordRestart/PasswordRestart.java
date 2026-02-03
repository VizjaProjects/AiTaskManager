package pl.ordovita.identity.domain.model.passwordRestart;

import pl.ordovita.identity.application.port.out.PasswordHasher;
import pl.ordovita.identity.domain.exception.PasswordRestartException;
import pl.ordovita.identity.domain.model.user.HashedPassword;
import pl.ordovita.identity.domain.model.user.RawPassword;
import pl.ordovita.identity.domain.model.user.UserId;

import java.time.Instant;
import java.util.UUID;

public class PasswordRestart {
    private final PasswordRestartId id;
    private final UUID token;
    private final Instant expresAt;
    private final boolean used;
    private final HashedPassword hashedPassword;
    private final Instant createdAt;
    private final Instant updatedAt;
    private final UserId userId;

    public PasswordRestart(PasswordRestartId id, UUID token, Instant expresAt, boolean used, HashedPassword hashedPassword, Instant createdAt, Instant updatedAt, UserId userId) {
        this.id = id;
        this.token = token;
        this.expresAt = expresAt;
        this.used = used;
        this.hashedPassword = hashedPassword;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.userId = userId;
    }

    public PasswordRestart(PasswordRestartId id, UUID token, Instant expresAt, boolean used, RawPassword rawPassword, Instant createdAt, Instant updatedAt, UserId userId, PasswordHasher passwordHasher) {
        if (id == null) throw new PasswordRestartException("id cannot be null");
        if (token == null) throw new PasswordRestartException("token cannot be null");
        if (expresAt == null) throw new PasswordRestartException("expresAt cannot be null");
        if (rawPassword == null) throw new PasswordRestartException("rawPassword cannot be null");
        if (userId == null) throw new PasswordRestartException("userId cannot be null");
        if (createdAt == null) throw new PasswordRestartException("createdAt cannot be null");
        if (updatedAt == null) throw new PasswordRestartException("updatedAt cannot be null");

        this.id = id;
        this.token = token;
        this.expresAt = expresAt;
        this.used = used;
        this.hashedPassword = passwordHasher.hash(rawPassword);
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.userId = userId;
    }

    public static PasswordRestart create(RawPassword rawPassword, UserId userId, PasswordHasher passwordHasher) {
        return new PasswordRestart(PasswordRestartId.generate(),
                UUID.randomUUID(),
                createExpresAt(),
                false,
                rawPassword,
                Instant.now(),
                Instant.now(),
                userId,
                passwordHasher);
    }

    public static Instant createExpresAt() {
        return Instant.now().plusMillis(15000);
    }


    public PasswordRestartId getId() {
        return id;
    }

    public UUID getToken() {
        return token;
    }

    public Instant getExpresAt() {
        return expresAt;
    }

    public boolean isUsed() {
        return used;
    }

    public HashedPassword getHashedPassword() {
        return hashedPassword;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public UserId getUserId() {
        return userId;
    }
}