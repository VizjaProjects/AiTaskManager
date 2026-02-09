package pl.ordovita.identity.domain.port;

import pl.ordovita.identity.domain.model.passwordRestart.PasswordRestart;
import pl.ordovita.identity.domain.model.passwordRestart.PasswordRestartId;
import pl.ordovita.identity.domain.model.user.UserId;

import java.util.Optional;
import java.util.UUID;

public interface PasswordRestartRepository {
    PasswordRestart save(PasswordRestart restart);

    boolean existsByToken(UUID token);

    Optional<PasswordRestart> findByUserId(UserId userId);

    Optional<PasswordRestart> findByToken(UUID token);

    Optional<PasswordRestart> findById(PasswordRestartId passwordRestartId);
}
