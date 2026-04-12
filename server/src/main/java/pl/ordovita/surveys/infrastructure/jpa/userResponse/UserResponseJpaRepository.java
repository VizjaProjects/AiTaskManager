package pl.ordovita.surveys.infrastructure.jpa.userResponse;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.ordovita.surveys.domain.model.userResponse.UserResponse;
import pl.ordovita.surveys.domain.model.userResponse.UserResponseId;
import pl.ordovita.surveys.infrastructure.jpa.questions.QuestionEntity;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface UserResponseJpaRepository extends JpaRepository<UserResponseEntity, UUID> {

    @Query("""
            FROM UserResponseEntity u
            WHERE u.userId.id = :userId
            """)
    Set<UserResponseEntity> findAllByUserId(@Param("userId") UUID userId);

    @Query("""
            FROM UserResponseEntity u
            WHERE u.id = :id AND
            u.userId.id = :userId
            """)
    Optional<UserResponseEntity> findByUserIdAndUserResponseId(@Param("id") UUID id, @Param("userId") UUID userId);

    @Modifying
    @Query("DELETE FROM UserResponseEntity u WHERE u.questionId.id IN :questionIds")
    void deleteAllByQuestionIds(@Param("questionIds") Collection<UUID> questionIds);
}
