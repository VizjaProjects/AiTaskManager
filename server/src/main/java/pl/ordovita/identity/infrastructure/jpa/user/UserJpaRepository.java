package pl.ordovita.identity.infrastructure.jpa.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserJpaRepository extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> findByEmail(String email);

    Optional<UserEntity> findByFullName(String fullName);

    boolean existsByEmail(String email);
}
