package pl.ordovita.tasks.infrastructure.jpa.status;

import jakarta.persistence.*;
import lombok.*;
import pl.ordovita.identity.infrastructure.jpa.user.UserEntity;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tasks_statuses")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskStatusEntity {

    @Id
    @Column(updatable = false, nullable = false, unique = true)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String color;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity userId;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;
}
