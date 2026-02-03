package pl.ordovita.identity.domain.model.user;

import java.util.UUID;

public record UserId(UUID value) {

    public static UserId generate() {
        return new UserId(UUID.randomUUID());
    }
}
