package pl.ordovita.tasks.domain.model.task;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.tasks.domain.exception.TaskException;
import pl.ordovita.tasks.domain.model.category.CategoryId;
import pl.ordovita.tasks.domain.model.status.TaskStatusId;

import java.time.Instant;

public class Task {

    private final TaskId id;
    private String title;
    private String description;
    private TaskPriority priority;
    private CategoryId categoryId;
    private int estimatedDuration;
    private Instant dueDateTime;
    private TaskStatusId statusId;
    private TaskSource source;
    private boolean accepted;
    private final UserId userId;
    private final Instant createdAt;
    private Instant updatedAt;

    public Task(TaskId id, String title, String description, TaskPriority priority, CategoryId categoryId,
                int estimatedDuration, Instant dueDateTime, TaskStatusId statusId, TaskSource source,
                boolean accepted, UserId userId, Instant createdAt, Instant updatedAt) {
        if (id == null) throw new TaskException("Task id cannot be null");
        if (title == null) throw new TaskException("Title cannot be null");
        if (priority == null) throw new TaskException("Priority cannot be null");
        if (statusId == null) throw new TaskException("StatusId cannot be null");
        if (source == null) throw new TaskException("Source cannot be null");
        if (userId == null) throw new TaskException("UserId cannot be null");
        if (createdAt == null) throw new TaskException("CreatedAt cannot be null");
        if (updatedAt == null) throw new TaskException("UpdatedAt cannot be null");
        this.id = id;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.categoryId = categoryId;
        this.estimatedDuration = estimatedDuration;
        this.dueDateTime = dueDateTime;
        this.statusId = statusId;
        this.source = source;
        this.accepted = accepted;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Task create(String title, String description, TaskPriority priority, CategoryId categoryId,
                              int estimatedDuration, Instant dueDateTime, TaskStatusId statusId,
                              TaskSource source, UserId userId) {
        boolean accepted = source != TaskSource.AI_PARSED;
        return new Task(TaskId.generate(), title, description, priority, categoryId, estimatedDuration,
                dueDateTime, statusId, source, accepted, userId, Instant.now(), Instant.now());
    }

    public void accept() {
        this.accepted = true;
        this.updatedAt = Instant.now();
    }

    public Task edit(String title, String description, TaskPriority priority, CategoryId categoryId,
                     int estimatedDuration, Instant dueDateTime, TaskStatusId statusId) {
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.categoryId = categoryId;
        this.estimatedDuration = estimatedDuration;
        this.dueDateTime = dueDateTime;
        this.statusId = statusId;
        this.updatedAt = Instant.now();
        return this;
    }

    public TaskId getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public CategoryId getCategoryId() {
        return categoryId;
    }

    public int getEstimatedDuration() {
        return estimatedDuration;
    }

    public Instant getDueDateTime() {
        return dueDateTime;
    }

    public TaskStatusId getStatusId() {
        return statusId;
    }

    public TaskSource getSource() {
        return source;
    }

    public boolean isAccepted() {
        return accepted;
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
