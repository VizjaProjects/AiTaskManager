package pl.ordovita.identity.infrastructure.jpa.passwordRestart;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PasswordRestartJpaRepository extends JpaRepository<PasswordRestartEntity, UUID> {

    Optional<PasswordRestartEntity> findByUserId(UUID userId);

    boolean existsByToken(UUID token);
}
