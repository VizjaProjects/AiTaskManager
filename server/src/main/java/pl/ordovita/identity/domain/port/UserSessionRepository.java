package pl.ordovita.identity.domain.port;

import pl.ordovita.identity.domain.model.userSession.UserSession;

import java.util.Optional;
import java.util.UUID;

public interface UserSessionRepository {
    UserSession save(UserSession session);

    Optional<UserSession> findById(UUID id);

    Optional<UserSession> findByRefreshToken(String refreshToken);

    Optional<UserSession> findByDeviceName(String deviceName);

    Optional<UserSession> findByUserSessionIp(String userSessionIp);

    void delete(UserSession session);

}
