package pl.ordovita.surveys.infrastructure.jpa.surveys;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pl.ordovita.surveys.domain.model.surveys.SurveyId;

import java.util.Set;
import java.util.UUID;

public interface SurveyJpaRepository extends JpaRepository<SurveyEntity, UUID> {

    @Query("""
            from SurveyEntity s
            WHERE s.isVisible = true
            """)
    Set<SurveyEntity> findAllActiveSurveys();

}
