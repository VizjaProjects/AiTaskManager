package pl.ordovita.surveys.infrastructure.jpa.surveys;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.ordovita.surveys.application.dto.UserResponseResult;


import java.util.Set;
import java.util.UUID;

public interface SurveyJpaRepository extends JpaRepository<SurveyEntity, UUID> {

    @Query("""
            from SurveyEntity s
            WHERE s.isVisible = true
            """)
    Set<SurveyEntity> findAllActiveSurveys();


    @Query("""
        SELECT s.id, s.description, q.id, q.questionText, r.id, r.textAnswer FROM SurveyEntity s
        LEFT JOIN  QuestionEntity q on q.surveyId.id = s.id
        LEFT JOIN UserResponseEntity r on r.questionId.id = q.id
        WHERE r.userId.id = :userId
        ORDER BY s.description DESC
        """)
    Set<UserResponseResult> getAllUserResponse(@Param("userId") UUID userId);
}
