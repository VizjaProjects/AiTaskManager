package pl.ordovita.surveys.application.port.in;

import java.util.UUID;

public interface DeleteUserResponseUseCase {

    record DeleteUserResponseCommand(UUID userResponseId){}

    void deleteUserResponse(DeleteUserResponseCommand command);
}
