package pl.ordovita.surveys.infrastructure.jpa.questions;

import jakarta.persistence.*;
import lombok.*;
import pl.ordovita.surveys.domain.model.questions.QuestionType;
import pl.ordovita.surveys.infrastructure.jpa.questionOption.QuestionOptionEntity;
import pl.ordovita.surveys.infrastructure.jpa.surveys.SurveyEntity;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "surveys_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionEntity {

    @Id
    @Column(updatable = false, nullable = false, unique = true)
    private UUID id;

    @JoinColumn(name = "survey_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private SurveyEntity surveyId;

    @Column(nullable = false)
    private String questionText;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private QuestionType questionType;

    @Column(nullable = false)
    private boolean isRequired;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

}
