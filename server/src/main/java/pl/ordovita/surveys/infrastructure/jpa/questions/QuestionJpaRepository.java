package pl.ordovita.surveys.infrastructure.jpa.questions;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface QuestionJpaRepository extends JpaRepository<QuestionEntity, UUID> {

    @Query("""
            FROM QuestionEntity q
            WHERE q.surveyId.id = :surveyId
            """)
    Set<QuestionEntity> findAllBySurveyId(@Param("surveyId") UUID surveyId);

    @Query("SELECT q.id FROM QuestionEntity q WHERE q.surveyId.id = :surveyId")
    List<UUID> findIdsBySurveyId(@Param("surveyId") UUID surveyId);

    @Modifying
    @Query("DELETE FROM QuestionEntity q WHERE q.surveyId.id = :surveyId")
    void deleteAllBySurveyId(@Param("surveyId") UUID surveyId);
}
