package pl.ordovita.tasks.presentation.dto;

import lombok.NonNull;
import pl.ordovita.tasks.domain.model.task.TaskPriority;
import pl.ordovita.tasks.domain.model.task.TaskSource;

import java.time.Instant;
import java.util.UUID;

public record CreateTaskRequest(@NonNull String title, String description, @NonNull TaskPriority priority,
                                UUID categoryId, int estimatedDuration, Instant dueDateTime,
                                @NonNull UUID statusId, @NonNull TaskSource source) {
}
