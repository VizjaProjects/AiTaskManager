package pl.ordovita.identity.application.port.in;

import java.time.Instant;
import java.util.UUID;

public interface ChangeFullNameUseCase {

    record ChangeFullNameCommand(String fullName){}
    record ChangeFullNameResult(String newFullName, UUID userId, Instant changedAt){}

    ChangeFullNameResult changeFullName(ChangeFullNameCommand command);
}
