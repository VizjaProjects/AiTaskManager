package pl.ordovita.shared.application.listener;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.ordovita.identity.application.port.in.EmailVerificationUseCase;
import pl.ordovita.identity.domain.event.UserRegisteredEvent;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class UserRegisterListenerTest {

    @Mock
    private EmailVerificationUseCase emailVerificationUseCase;

    @InjectMocks
    private UserRegisterListener userRegisterListener;

    @Test
    @DisplayName("Should handle user registered event")
    void shouldHandleUserRegisteredEvent() {
        UUID userId = UUID.randomUUID();
        UserRegisteredEvent event = new UserRegisteredEvent(userId, "test@example.com", "Test User");

        userRegisterListener.handle(event);

        verify(emailVerificationUseCase).executeEmailVerification(any(EmailVerificationUseCase.EmailVerificationCommand.class));
    }

    @Test
    @DisplayName("Should call email verification with correct user id")
    void shouldCallEmailVerificationWithCorrectUserId() {
        UUID userId = UUID.randomUUID();
        UserRegisteredEvent event = new UserRegisteredEvent(userId, "test@example.com", "Test User");

        userRegisterListener.handle(event);

        verify(emailVerificationUseCase).executeEmailVerification(
                new EmailVerificationUseCase.EmailVerificationCommand(userId)
        );
    }
}
