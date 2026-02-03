package pl.ordovita.identity.infrastructure.jpa.userSesion;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserSessionJpaRepository extends JpaRepository<UserSessionEntity, UUID> {

    Optional<UserSessionEntity> findByRefreshToken(String refreshToken);

    Optional<UserSessionEntity> findByDeviceName(String deviceName);

    Optional<UserSessionEntity> findByUserSessionIp(String userSessionIp);

    Optional<UserSessionEntity> findByUserId(UUID userId);
}
