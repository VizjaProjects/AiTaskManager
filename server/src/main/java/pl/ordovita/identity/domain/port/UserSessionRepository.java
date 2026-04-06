package pl.ordovita.identity.domain.port;

import pl.ordovita.identity.domain.model.userSession.UserSession;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserSessionRepository {
    UserSession save(UserSession session);

    Optional<UserSession> findById(UUID id);

    Optional<UserSession> findByRefreshToken(String refreshToken);

    Optional<UserSession> findByDeviceName(String deviceName);

    Optional<UserSession> findByUserSessionIp(String userSessionIp);

    List<UserSession> findAllByDeviceNameAndUserSessionIp(String deviceName, String userSessionIp);

    boolean existsByDeviceNameAndUserSessionIpAndExpiresAtAfter(String deviceName, String userSessionIp, Instant now);

    void delete(UserSession session);

}
