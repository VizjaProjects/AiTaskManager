package pl.ordovita.identity.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.ordovita.identity.application.port.in.LoginUseCase;
import pl.ordovita.identity.application.port.out.PasswordHasher;
import pl.ordovita.identity.application.port.out.TokenGenerator;
import pl.ordovita.identity.domain.exception.UserException;
import pl.ordovita.identity.domain.model.token.AccessToken;
import pl.ordovita.identity.domain.model.token.TokenMetadata;
import pl.ordovita.identity.domain.model.token.TokenPair;
import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.identity.domain.model.user.RawPassword;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.model.userSession.Status;
import pl.ordovita.identity.domain.model.userSession.UserSession;
import pl.ordovita.identity.domain.model.userSession.UserSessionId;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.identity.domain.port.UserSessionRepository;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class LoginService implements LoginUseCase {

    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;
    private final PasswordHasher passwordHasher;
    private final TokenGenerator tokenGenerator;

    @Override
    public LoginResult login(LoginCommand command) {

        Email email = new Email(command.email());
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UserException("User not found"));

        RawPassword rawPassword = new RawPassword(command.password());
        if (!passwordHasher.matches(rawPassword, user.getHashedPassword())) throw new UserException("Invalid credentials");

        if (!user.canLogin()) throw new UserException("User account is not active or email not verified");

        UserSessionId sessionId = UserSessionId.generate();

        TokenMetadata metadata = new TokenMetadata(user.getId(), user.getEmail(), user.getRole(), sessionId);

        AccessToken accessToken = tokenGenerator.generateAccessToken(metadata);

        String refreshToken = tokenGenerator.generateRefreshToken(metadata);

        Instant expiresAt = tokenGenerator.calculateRefreshTokenExpiration();

        UserSession userSession = UserSession.create(refreshToken,
                command.deviceName(),
                command.ipAddress(),
                expiresAt,
                Status.ACTIVE,
                user.getId());

        userSessionRepository.save(userSession);


        return new LoginResult(TokenPair.of(accessToken, refreshToken),
                new UserInfo(user.getId().value(), user.getEmail().value(), user.getFullName(), user.getRole()));
    }
}
