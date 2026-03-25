package pl.ordovita.tasks.domain.model.status;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.tasks.domain.exception.TaskStatusException;

import java.time.Instant;

public class TaskStatus {

    private final TaskStatusId id;
    private String name;
    private String color;
    private final UserId userId;
    private final Instant createdAt;
    private Instant updatedAt;

    public TaskStatus(TaskStatusId id, String name, String color, UserId userId, Instant createdAt, Instant updatedAt) {
        if (id == null) throw new TaskStatusException("TaskStatus id cannot be null");
        if (name == null) throw new TaskStatusException("Name cannot be null");
        if (color == null) throw new TaskStatusException("Color cannot be null");
        if (userId == null) throw new TaskStatusException("UserId cannot be null");
        if (createdAt == null) throw new TaskStatusException("CreatedAt cannot be null");
        if (updatedAt == null) throw new TaskStatusException("UpdatedAt cannot be null");
        this.id = id;
        this.name = name;
        this.color = color;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static TaskStatus create(String name, String color, UserId userId) {
        return new TaskStatus(TaskStatusId.generate(), name, color, userId, Instant.now(), Instant.now());
    }

    public TaskStatus edit(String name, String color) {
        this.name = name;
        this.color = color;
        this.updatedAt = Instant.now();
        return this;
    }

    public TaskStatusId getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getColor() {
        return color;
    }

    public UserId getUserId() {
        return userId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
