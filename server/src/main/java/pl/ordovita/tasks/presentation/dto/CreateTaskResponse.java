package pl.ordovita.tasks.presentation.dto;

import java.time.Instant;
import java.util.UUID;

public record CreateTaskResponse(UUID taskId, Instant createdAt) {
}
