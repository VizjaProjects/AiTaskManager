package pl.ordovita.identity.application.port.in;

import jakarta.servlet.http.HttpServletRequest;

import java.time.Instant;
import java.util.UUID;

public interface ChangePasswordUseCase {

    record ChangePasswordCommand(String oldPassword, String newPassword, String confirmPassword){}
    record ChangePasswordResult(UUID userId, Instant createdAt){}

    ChangePasswordResult change(ChangePasswordCommand command, HttpServletRequest request);
}
