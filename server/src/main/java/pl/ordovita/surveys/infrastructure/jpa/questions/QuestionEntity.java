package pl.ordovita.surveys.infrastructure.jpa.questions;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import pl.ordovita.surveys.domain.model.questions.QuestionType;
import pl.ordovita.surveys.infrastructure.jpa.questionOption.QuestionOptionEntity;
import pl.ordovita.surveys.infrastructure.jpa.surveys.SurveyEntity;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "surveys_questions")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionEntity {

    @Id
    @Column(updatable = false, nullable = false, unique = true)
    private UUID id;

    @JoinColumn(updatable = false, nullable = false, unique = true)
    @ManyToOne(fetch = FetchType.LAZY)
    private SurveyEntity surveyId;

    @OneToMany(fetch = FetchType.LAZY)
    private Set<QuestionOptionEntity> questionOptions;

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
