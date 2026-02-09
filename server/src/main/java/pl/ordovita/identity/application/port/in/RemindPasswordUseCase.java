package pl.ordovita.identity.application.port.in;

import jakarta.servlet.http.HttpServletRequest;

import java.time.Instant;
import java.util.UUID;

public interface RemindPasswordUseCase {

    record RemindPasswordRequestCommand(String email){}
    record RemindPasswordRequestResult(UUID token, UUID userId, UUID passwordRestartId) {}
    record RemindPasswordCommand(String email, UUID token, String rawPassword){}
    record RemindPasswordResult(Instant remindedAt, UUID userId){}

    RemindPasswordResult remindPassword(RemindPasswordCommand command, HttpServletRequest request);
    RemindPasswordRequestResult createRemindPasswordRequest(RemindPasswordRequestCommand command, HttpServletRequest request);
}
