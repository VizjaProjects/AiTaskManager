package pl.ordovita.identity.domain.model.userSession;


import java.util.UUID;

public record UserSessionId(UUID value) {

    public static UserSessionId generate() {
        return new UserSessionId(UUID.randomUUID());
    }
}
