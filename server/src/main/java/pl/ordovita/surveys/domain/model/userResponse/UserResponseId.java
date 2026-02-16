package pl.ordovita.surveys.domain.model.userResponse;

import java.util.UUID;

public record UserResponseId(UUID value) {

    public static UserResponseId generate() {
        return new UserResponseId(UUID.randomUUID());
    }
}
