package pl.ordovita.identity.domain.model.passwordRestart;


import java.util.UUID;

public record PasswordRestartId(UUID value) {

    public static PasswordRestartId generate() {
        return new PasswordRestartId(UUID.randomUUID());
    }

}
