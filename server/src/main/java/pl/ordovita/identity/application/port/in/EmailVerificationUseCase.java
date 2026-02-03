package pl.ordovita.identity.application.port.in;

import java.util.UUID;

public interface EmailVerificationUseCase {

    record EmailVerificationCommand(UUID userId) {}
    record EmailVerificationResult(UUID userId, String fullName){}

    EmailVerificationResult executeEmailVerification(EmailVerificationCommand command);

}
