package pl.ordovita.identity.application.port.in;

import java.time.Instant;
import java.util.UUID;

public interface VerificationAccountUseCase {

    record VerificationAccountCommand(UUID userId, String code){}
    record VerificationAccountResult(UUID userId, String fullName, String email, String code){}

    VerificationAccountResult verify(VerificationAccountCommand command);

}
