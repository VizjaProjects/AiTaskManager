package pl.ordovita.identity.application.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.ordovita.identity.application.port.in.LogoutUseCase;
import pl.ordovita.identity.domain.exception.TokenException;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.domain.model.userSession.Status;
import pl.ordovita.identity.domain.model.userSession.UserSession;
import pl.ordovita.identity.domain.port.UserSessionRepository;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LogoutServiceTest {

    @Mock
    private UserSessionRepository userSessionRepository;

    @InjectMocks
    private LogoutService logoutService;


    @Test
    @DisplayName("Should throw exception when refresh token is invalid")
    void shouldThrowExceptionWhenRefreshTokenIsInvalid() {
        String refreshToken = "invalidToken";
        LogoutUseCase.LogoutCommand command = new LogoutUseCase.LogoutCommand(refreshToken);

        when(userSessionRepository.findByRefreshToken(refreshToken)).thenReturn(Optional.empty());

        assertThrows(TokenException.class, () -> logoutService.logout(command));
        verify(userSessionRepository, never()).delete(any(UserSession.class));
    }
}
