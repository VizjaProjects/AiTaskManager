package pl.ordovita.identity.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.ordovita.identity.application.port.in.LogoutUseCase;
import pl.ordovita.identity.domain.exception.TokenException;
import pl.ordovita.identity.domain.model.userSession.UserSession;
import pl.ordovita.identity.domain.port.UserSessionRepository;

@Service
@RequiredArgsConstructor
public class LogoutService implements LogoutUseCase {

    private final UserSessionRepository userSessionRepository;

    @Override
    public void logout(LogoutCommand command) {
        UserSession session = userSessionRepository.findByRefreshToken(command.refreshToken()).orElseThrow(() -> new TokenException("Invalid refresh token"));

        userSessionRepository.delete(session);
    }
}
