package pl.ordovita.tasks.domain.model.category;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.tasks.domain.exception.CategoryException;

import java.time.Instant;

public class TaskCategory {

    private final CategoryId id;
    private String name;
    private String color;
    private final UserId userId;
    private final Instant createdAt;
    private Instant updatedAt;

    public TaskCategory(CategoryId id, String name, String color, UserId userId, Instant createdAt, Instant updatedAt) {
        if (id == null) throw new CategoryException("Category id cannot be null");
        if (name == null) throw new CategoryException("Name cannot be null");
        if (color == null) throw new CategoryException("Color cannot be null");
        if (userId == null) throw new CategoryException("UserId cannot be null");
        if (createdAt == null) throw new CategoryException("CreatedAt cannot be null");
        if (updatedAt == null) throw new CategoryException("UpdatedAt cannot be null");
        this.id = id;
        this.name = name;
        this.color = color;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static TaskCategory create(String name, String color, UserId userId) {
        return new TaskCategory(CategoryId.generate(), name, color, userId, Instant.now(), Instant.now());
    }

    public TaskCategory edit(String name, String color) {
        this.name = name;
        this.color = color;
        this.updatedAt = Instant.now();
        return this;
    }

    public CategoryId getId() {
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
