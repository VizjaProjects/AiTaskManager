package pl.ordovita.identity.application.port.in;

import pl.ordovita.identity.application.port.out.PasswordHasher;

import java.util.UUID;

public interface RegisterUserUseCase {

    record RegisterUserCommand(String fullName, String email, String rawPassword, PasswordHasher passwordHasher) {
    }

    record RegisterUserResult(UUID userId, String email) {
    }


    RegisterUserResult register(RegisterUserCommand command);
}
