package pl.ordovita.surveys.infrastructure.jpa.userResponse;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.ordovita.surveys.domain.model.userResponse.UserResponse;
import pl.ordovita.surveys.infrastructure.jpa.questions.QuestionEntity;

import java.util.Collection;
import java.util.Set;
import java.util.UUID;

public interface UserResponseJpaRepository extends JpaRepository<UserResponseEntity, UUID> {

    @Query("""
            FROM UserResponseEntity u
            WHERE u.userId.id = :userId
            """)
    Set<UserResponseEntity> findAllByUserId(@Param("userId") UUID userId);
}
