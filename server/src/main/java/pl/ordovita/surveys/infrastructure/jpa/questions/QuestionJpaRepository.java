package pl.ordovita.surveys.infrastructure.jpa.questions;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface QuestionJpaRepository extends JpaRepository<QuestionEntity, UUID> {

}
