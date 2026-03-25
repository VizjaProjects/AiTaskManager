package pl.ordovita.tasks.domain.model.category;

import java.util.UUID;

public record CategoryId(UUID value) {

    public static CategoryId generate() {
        return new CategoryId(UUID.randomUUID());
    }
}
