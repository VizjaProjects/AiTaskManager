package pl.ordovita.surveys.infrastructure.jpa.surveys;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SurveyJpaRepository extends JpaRepository<SurveyEntity, UUID> {
}
