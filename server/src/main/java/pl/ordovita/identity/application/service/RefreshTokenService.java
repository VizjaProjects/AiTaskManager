package pl.ordovita.identity.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.ordovita.identity.application.port.in.RefreshTokenUseCase;
import pl.ordovita.identity.application.port.out.TokenGenerator;
import pl.ordovita.identity.domain.exception.TokenException;
import pl.ordovita.identity.domain.model.token.AccessToken;
import pl.ordovita.identity.domain.model.token.TokenMetadata;
import pl.ordovita.identity.domain.model.token.TokenPair;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.model.userSession.Status;
import pl.ordovita.identity.domain.model.userSession.UserSession;
import pl.ordovita.identity.domain.model.userSession.UserSessionId;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.identity.domain.port.UserSessionRepository;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class RefreshTokenService implements RefreshTokenUseCase {

    private final UserSessionRepository userSessionRepository;
    private final UserRepository userRepository;
    private final TokenGenerator tokenGenerator;

    @Override
    public TokenPair refresh(RefreshCommand command) {

        UserSession oldSession = userSessionRepository.findByRefreshToken(command.refreshToken()).orElseThrow(() -> new TokenException(
                "Invalid refresh token"));

        if (oldSession.getExpiresAt().isBefore(Instant.now())) throw new TokenException("Refresh token has expired");

        User user = userRepository.findById(oldSession.getUserId()).orElseThrow(() -> new TokenException(
                "User not found"));

        if (!user.canLogin()) throw new TokenException("User is not allowed to login");

        oldSession.detectiveSession();

        userSessionRepository.delete(oldSession);

        UserSessionId userSessionId = UserSessionId.generate();

        TokenMetadata newMetadata = new TokenMetadata(user.getId(), user.getEmail(), user.getRole(), userSessionId);

        AccessToken newAccessToken = tokenGenerator.generateAccessToken(newMetadata);
        String newRefreshToken = tokenGenerator.generateRefreshToken(newMetadata);
        Instant newExpiresAt = tokenGenerator.calculateRefreshTokenExpiration();


        UserSession newSession = UserSession.create(newRefreshToken,
                command.deviceName(),
                command.ipAddress(),
                newExpiresAt,
                Status.ACTIVE,
                user.getId());

        userSessionRepository.save(newSession);


        return TokenPair.of(newAccessToken, newRefreshToken);
    }
}
