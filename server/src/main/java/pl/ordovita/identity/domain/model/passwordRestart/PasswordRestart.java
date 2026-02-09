package pl.ordovita.identity.domain.model.passwordRestart;

import pl.ordovita.identity.application.port.out.PasswordHasher;
import pl.ordovita.identity.domain.event.RemindPasswordEvent;
import pl.ordovita.identity.domain.exception.PasswordRestartException;
import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.identity.domain.model.user.HashedPassword;
import pl.ordovita.identity.domain.model.user.RawPassword;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.shared.domain.event.DomainEvent;
import pl.ordovita.shared.domain.event.DomainEventPublisher;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class PasswordRestart {
    private final PasswordRestartId id;
    private final UUID token;
    private final Instant expresAt;
    private boolean used;
    private final HashedPassword hashedPassword;
    private final Instant createdAt;
    private Instant updatedAt;
    private final UserId userId;

    private final List<DomainEvent> domainEvents = new ArrayList<>();


    public PasswordRestart(PasswordRestartId id, UUID token, Instant expresAt, boolean used, HashedPassword hashedPassword, Instant createdAt, Instant updatedAt, UserId userId) {
        if (id == null) throw new PasswordRestartException("id cannot be null");
        if (token == null) throw new PasswordRestartException("token cannot be null");
        if (expresAt == null) throw new PasswordRestartException("expresAt cannot be null");
        if (hashedPassword == null) throw new PasswordRestartException("hashedPassword cannot be null");
        if (userId == null) throw new PasswordRestartException("userId cannot be null");
        if (createdAt == null) throw new PasswordRestartException("createdAt cannot be null");
        if (updatedAt == null) throw new PasswordRestartException("updatedAt cannot be null");
        this.id = id;
        this.token = token;
        this.expresAt = expresAt;
        this.used = used;
        this.hashedPassword = hashedPassword;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.userId = userId;
    }

    public static PasswordRestart create(HashedPassword hashedPassword, UserId userId, Email email, String ipAddress) {
        UUID token = UUID.randomUUID();
        Instant expresAt = createExpresAt();
        Instant now = Instant.now();
        PasswordRestart passwordRestart =  new PasswordRestart(PasswordRestartId.generate(),
                token,
                expresAt,
                false,
                hashedPassword,
                now,
                now,
                userId);

        passwordRestart.registerEvent(new RemindPasswordEvent(email,token,expresAt,now, ipAddress));

        return passwordRestart;
    }

    public static Instant createExpresAt() {
        return Instant.now().plusMillis(900000);
    }

    public boolean canRestart(UUID token) {
        if(used) return false;
        if(expresAt.isBefore(Instant.now())) return false;
        return this.token.equals(token);

    }

    public void restart(RawPassword rawPassword, PasswordHasher passwordHasher) {
        if(passwordHasher.matches(rawPassword,this.hashedPassword)) throw new PasswordRestartException("Your new password cannot be the same as your previous one");
        this.used = true;
        this.updatedAt = Instant.now();
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