package pl.ordovita.surveys.infrastructure.jpa.userResponse;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import pl.ordovita.identity.infrastructure.jpa.user.UserEntity;
import pl.ordovita.surveys.infrastructure.jpa.questions.QuestionEntity;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "surveys_user_responses")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseEntity {

    @Id
    @Column(updatable = false, nullable = false, unique = true)
    private UUID id;

    @JoinColumn(updatable = false, nullable = false, unique = true)
    @ManyToOne(fetch = FetchType.LAZY)
    private UserEntity userId;

    @JoinColumn(updatable = false, nullable = false, unique = true)
    @OneToOne
    private QuestionEntity questionId;

    @Column(nullable = false)
    private String textAnswer;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

}
