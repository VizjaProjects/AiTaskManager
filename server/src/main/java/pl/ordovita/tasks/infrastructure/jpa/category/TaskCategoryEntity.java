package pl.ordovita.tasks.infrastructure.jpa.category;

import jakarta.persistence.*;
import lombok.*;
import pl.ordovita.identity.infrastructure.jpa.user.UserEntity;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tasks_categories")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskCategoryEntity {

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
