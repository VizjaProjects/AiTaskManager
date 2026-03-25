package pl.ordovita.tasks.domain.model.task;

import java.util.UUID;

public record TaskId(UUID value) {

    public static TaskId generate() {
        return new TaskId(UUID.randomUUID());
    }
}
