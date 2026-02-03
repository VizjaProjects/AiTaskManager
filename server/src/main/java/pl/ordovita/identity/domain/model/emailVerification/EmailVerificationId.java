package pl.ordovita.identity.domain.model.emailVerification;

import java.util.UUID;

public record EmailVerificationId(UUID value) {

    public static EmailVerificationId generate() {
        return new EmailVerificationId(UUID.randomUUID());
    }

}
