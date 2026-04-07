package pl.ordovita.tasks.infrastructure.jpa.aiStatistic;

import jakarta.persistence.*;
import lombok.*;
import pl.ordovita.identity.infrastructure.jpa.user.UserEntity;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_statistics")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AiStatisticEntity {

    @Id
    @Column(updatable = false, nullable = false, unique = true)
    private UUID id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String promptText;

    @Column(nullable = false)
    private int inputTokens;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity userId;

    @Column(nullable = false)
    private Instant createdAt;
}
