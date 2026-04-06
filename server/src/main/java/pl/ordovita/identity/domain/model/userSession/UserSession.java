package pl.ordovita.identity.domain.model.userSession;

import pl.ordovita.identity.domain.exception.UserSessionException;
import pl.ordovita.identity.domain.model.user.UserId;

import java.time.Instant;

public class UserSession {

    private final UserSessionId id;
    private final String refreshToken;
    private final String deviceName;
    private final String userSessionIp;
    private final Instant createdAt;
    private final Instant updatedAt;
    private final Instant expiresAt;
    private Status status;
    private final UserId userId;

    public UserSession(UserSessionId id, String refreshToken, String deviceName, String userSessionIp, Instant createdAt, Instant updatedAt, Instant expiresAt,Status status, UserId userId) {
        if (id == null) {
            throw new UserSessionException("User session id cannot be null");
        }
        if (refreshToken == null) {
            throw new UserSessionException("User session refresh token cannot be null");
        }
        if (deviceName == null) {
            throw new UserSessionException("User session device name cannot be null");
        }
        if (userSessionIp == null) {
            throw new UserSessionException("User session user session ip cannot be null");
        }
        if (createdAt == null) {
            throw new UserSessionException("User session createdAt cannot be null");
        }
        if (updatedAt == null) {
            throw new UserSessionException("User session updatedAt cannot be null");
        }
        if (expiresAt == null) {
            throw new UserSessionException("User session expiresAt cannot be null");
        }
        if (status == null) {
            throw new UserSessionException("User session status cannot be null");
        }
        if (userId == null) {
            throw new UserSessionException("User session userId cannot be null");
        }
        this.id = id;
        this.refreshToken = refreshToken;
        this.deviceName = deviceName;
        this.userSessionIp = userSessionIp;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.expiresAt = expiresAt;
        this.status = status;
        this.userId = userId;
    }

    public static UserSession create(UserSessionId id, String refreshToken, String deviceName, String userSessionIp, Instant expiresAt, Status status, UserId userId) {
        return new UserSession(id,
                refreshToken,
                deviceName,
                userSessionIp,
                Instant.now(),
                Instant.now(),
                expiresAt,
                status,
                userId);
    }

    public void detectiveSession(){
        this.status = Status.EXPIRED;
    }


    public UserSessionId getId() {
        return id;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public String getUserSessionIp() {
        return userSessionIp;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public UserId getUserId() {
        return userId;
    }

    public Status getStatus() {
        return status;
    }
}
