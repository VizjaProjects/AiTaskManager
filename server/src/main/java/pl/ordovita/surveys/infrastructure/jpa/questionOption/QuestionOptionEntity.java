package pl.ordovita.surveys.infrastructure.jpa.questionOption;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "surveys_question_options")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuestionOptionEntity {

    @Id
    @Column(updatable = false, nullable = false, unique = true)
    private UUID id;

    @Size(min = 3, max = 100)
    @Column(nullable = false)
    private String optionText;

    @Column(nullable = false)
    private Instant createAt;

    @Column(nullable = false)
    private Instant updateAt;
}
