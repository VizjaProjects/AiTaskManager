package pl.ordovita.surveys.infrastructure.jpa.userResponse;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserResponseJpaRepository extends JpaRepository<UserResponseEntity, UUID> {
}
