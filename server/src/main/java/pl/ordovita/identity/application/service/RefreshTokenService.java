package pl.ordovita.identity.application.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.ordovita.identity.application.port.in.DeviceManagerUseCase;
import pl.ordovita.identity.application.port.in.RefreshTokenUseCase;
import pl.ordovita.identity.domain.exception.TokenException;
import pl.ordovita.identity.domain.model.token.TokenPair;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.model.userSession.UserSession;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.identity.domain.port.UserSessionRepository;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class RefreshTokenService implements RefreshTokenUseCase {

    private final UserSessionRepository userSessionRepository;
    private final UserRepository userRepository;
    private final SessionManager sessionManager;
    private final DeviceManagerUseCase deviceManagerUseCase;

    @Override
    public TokenPair refresh(RefreshCommand command, HttpServletResponse response, HttpServletRequest httpRequest) {
        UserSession oldSession = userSessionRepository.findByRefreshToken(command.refreshToken())
                .orElseThrow(() -> new TokenException("Invalid refresh token"));
        String deviceName = deviceManagerUseCase.parseDeviceName(httpRequest);
        String ipAddress = deviceManagerUseCase.getClientIp(httpRequest);

        if (oldSession.getExpiresAt().isBefore(Instant.now())) {
            throw new TokenException("Refresh token has expired");
        }

        User user = userRepository.findById(oldSession.getUserId())
                .orElseThrow(() -> new TokenException("User not found"));

        if (!user.canLogin()) {
            throw new TokenException("User is not allowed to login");
        }

        oldSession.detectiveSession();
        userSessionRepository.delete(oldSession);

        return sessionManager.createNewSession(user,deviceName,ipAddress,response);
    }
}