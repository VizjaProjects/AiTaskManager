package pl.ordovita.identity.infrastructure.adapter.persistence.userSession;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import pl.ordovita.identity.domain.model.userSession.UserSession;
import pl.ordovita.identity.domain.port.UserSessionRepository;
import pl.ordovita.identity.infrastructure.jpa.userSesion.UserSessionEntity;
import pl.ordovita.identity.infrastructure.jpa.userSesion.UserSessionJpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class UserSessionRepositoryAdapter implements UserSessionRepository {

    private final UserSessionJpaRepository repository;

    @Override
    public UserSession save(UserSession session) {
        UserSessionEntity entity = repository.save(UserSessionMapper.from(session));
        return UserSessionMapper.toDomain(entity);
    }

    @Override
    public Optional<UserSession> findById(UUID id) {
        return repository.findById(id).map(UserSessionMapper::toDomain);
    }

    @Override
    public Optional<UserSession> findByRefreshToken(String refreshToken) {
        return repository.findByRefreshToken(refreshToken).map(UserSessionMapper::toDomain);
    }

    @Override
    public Optional<UserSession> findByDeviceName(String deviceName) {
        return repository.findByDeviceName(deviceName).map(UserSessionMapper::toDomain);
    }

    @Override
    public Optional<UserSession> findByUserSessionIp(String userSessionIp) {
        return repository.findByUserSessionIp(userSessionIp).map(UserSessionMapper::toDomain);
    }

    @Override
    public void delete(UserSession session) {
        repository.delete(UserSessionMapper.from(session));
    }

    @Override
    public boolean existsByDeviceNameAndUserSessionIpAndExpiresAtAfter(String deviceName, String userSessionIp, Instant now) {
        return repository.existsByDeviceNameAndUserSessionIpAndExpiresAtAfter(deviceName, userSessionIp, now);
    }
}
