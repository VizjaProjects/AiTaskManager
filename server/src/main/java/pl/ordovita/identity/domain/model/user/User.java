package pl.ordovita.identity.domain.model.user;

import pl.ordovita.identity.application.port.out.PasswordHasher;
import pl.ordovita.identity.domain.event.PasswordChangedEvent;
import pl.ordovita.identity.domain.event.UserRegisteredEvent;
import pl.ordovita.identity.domain.exception.UserException;
import pl.ordovita.shared.domain.event.DomainEvent;
import pl.ordovita.shared.domain.event.DomainEventPublisher;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class User {

    private final UserId id;
    private String fullName;
    private final Email email;
    private final Role role;
    private final Instant createdAt;
    private boolean isEnabled;
    private final List<DomainEvent> domainEvents = new ArrayList<>();
    private HashedPassword password;
    private Instant updatedAt;
    private Instant lastLoginAt;
    private boolean emailVerified;
    private Instant emailVerifiedAt;


    public User(UserId id, String fullName, Email email, Role role, HashedPassword hashedPassword, Instant createdAt, Instant updatedAt, Instant lastLoginAt, boolean isEnabled, boolean emailVerified, Instant emailVerifiedAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.password = hashedPassword;
        this.isEnabled = isEnabled;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lastLoginAt = lastLoginAt;
        this.emailVerified = emailVerified;
        this.emailVerifiedAt = emailVerifiedAt;
    }

    public User(UserId id, String fullName, Email email, Role role, RawPassword rawPassword, boolean isEnabled, Instant createdAt, Instant updatedAt, PasswordHasher passwordHasher) {
        if (id == null) throw new UserException("User id cannot be null");
        if (fullName == null || fullName.isBlank()) throw new UserException("Full name cannot be null");
        if (email == null) throw new UserException("Email cannot be null");
        if (role == null) throw new UserException("Role cannot be null");
        if (rawPassword == null) throw new UserException("Raw password cannot be null");
        if (createdAt == null) throw new UserException("Created at cannot be null");
        if (updatedAt == null) throw new UserException("Updated at cannot be null");
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.password = passwordHasher.hash(rawPassword);
        this.isEnabled = isEnabled;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static User createUser(String fullName, Email email, RawPassword rawPassword, PasswordHasher passwordHasher) {
        User user = new User(UserId.generate(),
                fullName,
                email,
                Role.USER,
                rawPassword,
                false,
                Instant.now(),
                Instant.now(),
                passwordHasher);

        user.registerEvent(new UserRegisteredEvent(user.getId().value(), user.getEmail().value(), user.getFullName()));

        return user;
    }

    public void passwordChanged(String device, String ipAddress) {
        this.registerEvent(new PasswordChangedEvent(this.email,Instant.now(),device,ipAddress));
    }

    public void changeFullName(String newFullName) {
        if(fullName == null) throw new UserException("Full name cannot be null");
        if(this.fullName.equals(newFullName)) throw new UserException("Your new full name cannot be the same as your previous one ");

        this.fullName = newFullName;
    }


    public void verifyEmail() {
        if (this.emailVerified) {
            throw new UserException("Email already verified");
        }
        this.emailVerified = true;
        this.isEnabled = true;
        this.emailVerifiedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public boolean canLogin() {
        return isEnabled && emailVerified;
    }

    public void login() {
        this.lastLoginAt = Instant.now();
    }

    public void userDataUpdated() {
        this.updatedAt = Instant.now();
    }

    public boolean isPasswordCorrect(RawPassword rawPassword, PasswordHasher passwordHasher) {
        return passwordHasher.matches(rawPassword, password);
    }

    public void remindPassword(RawPassword rawPassword, PasswordHasher passwordHasher) {
        if (!canLogin()) throw new UserException("Account is disabled!");
        this.password = passwordHasher.hash(rawPassword);
    }

    public void changePassword(RawPassword oldPassword, RawPassword newPassword, RawPassword confirmPassword, PasswordHasher passwordHasher) {
        if (!canLogin()) throw new UserException("Account is disabled!");
        if (!newPassword.equals(confirmPassword)) throw new UserException("Passwords do not match!");
        if (oldPassword.equals(newPassword))
            throw new UserException("Your new password cannot be the same as your previous one");

        this.password = passwordHasher.hash(newPassword);
    }

    public UserId getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public Email getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public HashedPassword getHashedPassword() {
        return password;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public boolean isEnabled() {
        return isEnabled;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public Instant getEmailVerifiedAt() {
        return emailVerifiedAt;
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
