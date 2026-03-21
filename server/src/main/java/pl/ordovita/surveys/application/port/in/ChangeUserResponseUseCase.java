package pl.ordovita.surveys.application.port.in;

import java.time.Instant;
import java.util.UUID;

public interface ChangeUserResponseUseCase {

    record ChangeUserResponseCommand(UUID userResponseId, String newTextAnswer){}
    record ChangeUserResponseResult(UUID userResponseId, String newTextAnswer, Instant updatedAt){}

    ChangeUserResponseResult changeUserResponse(ChangeUserResponseCommand command);
}
