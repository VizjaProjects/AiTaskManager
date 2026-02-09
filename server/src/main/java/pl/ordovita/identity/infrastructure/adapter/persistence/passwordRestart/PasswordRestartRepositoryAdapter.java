package pl.ordovita.identity.infrastructure.adapter.persistence.passwordRestart;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import pl.ordovita.identity.domain.model.passwordRestart.PasswordRestart;
import pl.ordovita.identity.domain.model.passwordRestart.PasswordRestartId;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.domain.port.PasswordRestartRepository;
import pl.ordovita.identity.infrastructure.jpa.passwordRestart.PasswordRestartEntity;
import pl.ordovita.identity.infrastructure.jpa.passwordRestart.PasswordRestartJpaRepository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class PasswordRestartRepositoryAdapter implements PasswordRestartRepository {

    private final PasswordRestartJpaRepository repository;

    @Override
    public PasswordRestart save(PasswordRestart restart) {
        PasswordRestartEntity entity = PasswordRestartEntityMapper.from(restart);
        return PasswordRestartEntityMapper.toDomain(repository.save(entity));
    }

    @Override
    public boolean existsByToken(UUID token) {
        return repository.existsByToken(token);
    }

    @Override
    public Optional<PasswordRestart> findByUserId(UserId userId) {
        return repository.findByUserId(userId.value()).map(PasswordRestartEntityMapper::toDomain);
    }

    @Override
    public Optional<PasswordRestart> findById(PasswordRestartId passwordRestartId) {
        return repository.findById(passwordRestartId.value()).map(PasswordRestartEntityMapper::toDomain);
    }

    @Override
    public Optional<PasswordRestart> findByToken(UUID token) {
        return repository.findByToken(token).map(PasswordRestartEntityMapper::toDomain);
    }
}
