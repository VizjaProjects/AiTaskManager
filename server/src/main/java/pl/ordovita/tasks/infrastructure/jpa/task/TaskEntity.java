package pl.ordovita.tasks.infrastructure.jpa.task;

import jakarta.persistence.*;
import lombok.*;
import pl.ordovita.identity.infrastructure.jpa.user.UserEntity;
import pl.ordovita.tasks.domain.model.task.TaskPriority;
import pl.ordovita.tasks.domain.model.task.TaskSource;
import pl.ordovita.tasks.infrastructure.jpa.category.TaskCategoryEntity;
import pl.ordovita.tasks.infrastructure.jpa.status.TaskStatusEntity;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tasks_tasks")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskEntity {

    @Id
    @Column(updatable = false, nullable = false, unique = true)
    private UUID id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskPriority priority;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private TaskCategoryEntity categoryId;

    @Column(nullable = false)
    private int estimatedDuration;

    private Instant dueDateTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id", nullable = false)
    private TaskStatusEntity statusId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskSource source;

    @Column(nullable = false)
    private boolean accepted;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity userId;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;
}
