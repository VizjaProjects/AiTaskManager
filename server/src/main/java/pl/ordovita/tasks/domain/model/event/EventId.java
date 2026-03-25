package pl.ordovita.tasks.domain.model.event;

import java.util.UUID;

public record EventId(UUID value) {

    public static EventId generate() {
        return new EventId(UUID.randomUUID());
    }
}
