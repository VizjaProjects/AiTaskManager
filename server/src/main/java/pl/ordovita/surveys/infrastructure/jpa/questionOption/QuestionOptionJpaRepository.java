package pl.ordovita.surveys.infrastructure.jpa.questionOption;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface QuestionOptionJpaRepository extends JpaRepository<QuestionOptionEntity, UUID> {
}
