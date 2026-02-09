package pl.ordovita.identity.domain.model.userSession;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import pl.ordovita.identity.domain.exception.UserSessionException;
import pl.ordovita.identity.domain.model.user.UserId;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class UserSessionTest {

    @Test
    @DisplayName("Should create user session successfully")
    void shouldCreateUserSessionSuccessfully() {
        String refreshToken = "refreshToken";
        String deviceName = "Chrome on Windows";
        String ipAddress = "192.168.1.1";
        Instant expiresAt = Instant.now().plusSeconds(3600);
        UserId userId = UserId.generate();

        UserSession userSession = UserSession.create(refreshToken, deviceName, ipAddress, expiresAt, Status.ACTIVE, userId);

        assertNotNull(userSession);
        assertEquals(refreshToken, userSession.getRefreshToken());
        assertEquals(deviceName, userSession.getDeviceName());
        assertEquals(ipAddress, userSession.getUserSessionIp());
        assertEquals(expiresAt, userSession.getExpiresAt());
        assertEquals(Status.ACTIVE, userSession.getStatus());
        assertEquals(userId, userSession.getUserId());
        assertNotNull(userSession.getId());
        assertNotNull(userSession.getCreatedAt());
        assertNotNull(userSession.getUpdatedAt());
    }

    @Test
    @DisplayName("Should mark session as expired")
    void shouldMarkSessionAsExpired() {
        String refreshToken = "refreshToken";
        String deviceName = "Chrome on Windows";
        String ipAddress = "192.168.1.1";
        Instant expiresAt = Instant.now().plusSeconds(3600);
        UserId userId = UserId.generate();

        UserSession userSession = UserSession.create(refreshToken, deviceName, ipAddress, expiresAt, Status.ACTIVE, userId);
        userSession.detectiveSession();

        assertEquals(Status.EXPIRED, userSession.getStatus());
    }

    @Test
    @DisplayName("Should throw exception when id is null")
    void shouldThrowExceptionWhenIdIsNull() {
        assertThrows(UserSessionException.class, () -> new UserSession(
                null,
                "refreshToken",
                "Chrome on Windows",
                "192.168.1.1",
                Instant.now(),
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Status.ACTIVE,
                UserId.generate()
        ));
    }

    @Test
    @DisplayName("Should throw exception when refresh token is null")
    void shouldThrowExceptionWhenRefreshTokenIsNull() {
        assertThrows(UserSessionException.class, () -> new UserSession(
                UserSessionId.generate(),
                null,
                "Chrome on Windows",
                "192.168.1.1",
                Instant.now(),
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Status.ACTIVE,
                UserId.generate()
        ));
    }

    @Test
    @DisplayName("Should throw exception when device name is null")
    void shouldThrowExceptionWhenDeviceNameIsNull() {
        assertThrows(UserSessionException.class, () -> new UserSession(
                UserSessionId.generate(),
                "refreshToken",
                null,
                "192.168.1.1",
                Instant.now(),
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Status.ACTIVE,
                UserId.generate()
        ));
    }

    @Test
    @DisplayName("Should throw exception when user session ip is null")
    void shouldThrowExceptionWhenUserSessionIpIsNull() {
        assertThrows(UserSessionException.class, () -> new UserSession(
                UserSessionId.generate(),
                "refreshToken",
                "Chrome on Windows",
                null,
                Instant.now(),
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Status.ACTIVE,
                UserId.generate()
        ));
    }

    @Test
    @DisplayName("Should throw exception when status is null")
    void shouldThrowExceptionWhenStatusIsNull() {
        assertThrows(UserSessionException.class, () -> new UserSession(
                UserSessionId.generate(),
                "refreshToken",
                "Chrome on Windows",
                "192.168.1.1",
                Instant.now(),
                Instant.now(),
                Instant.now().plusSeconds(3600),
                null,
                UserId.generate()
        ));
    }

    @Test
    @DisplayName("Should throw exception when user id is null")
    void shouldThrowExceptionWhenUserIdIsNull() {
        assertThrows(UserSessionException.class, () -> new UserSession(
                UserSessionId.generate(),
                "refreshToken",
                "Chrome on Windows",
                "192.168.1.1",
                Instant.now(),
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Status.ACTIVE,
                null
        ));
    }
}
