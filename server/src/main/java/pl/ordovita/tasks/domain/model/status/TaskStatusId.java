package pl.ordovita.tasks.domain.model.status;

import java.util.UUID;

public record TaskStatusId(UUID value) {

    public static TaskStatusId generate() {
        return new TaskStatusId(UUID.randomUUID());
    }
}
