package pl.ordovita.identity.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.ordovita.identity.application.port.in.DeviceManagerUseCase;
import pl.ordovita.identity.application.port.in.LoginUseCase;
import pl.ordovita.identity.application.port.out.PasswordHasher;
import pl.ordovita.identity.domain.exception.UserException;
import pl.ordovita.identity.domain.model.token.TokenPair;
import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.identity.domain.model.user.RawPassword;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.model.userSession.UserSession;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.identity.domain.port.UserSessionRepository;

@Service
@RequiredArgsConstructor
public class LoginService implements LoginUseCase {

    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;
    private final PasswordHasher passwordHasher;
    private final SessionManager sessionManager;
    private final DeviceManagerUseCase deviceManagerUseCase;

    @Override
    public LoginResult login(LoginCommand command) {
        Email email = new Email(command.email());
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UserException("User not found"));

        RawPassword rawPassword = new RawPassword(command.password());
        if (!user.isPasswordCorrect(rawPassword, passwordHasher)) {
            throw new UserException("Invalid credentials");
        }
        if (!user.canLogin()) {
            throw new UserException("User account is not active or email not verified");
        }

        user.login();

        userRepository.save(user);

        TokenPair tokenPair = handleUserSession(user, command);

        return new LoginResult(tokenPair,
                new UserInfo(user.getId().value(), user.getEmail().value(), user.getFullName(), user.getRole()));

    }

    private TokenPair handleUserSession(User user, LoginCommand command) {
        String deviceName = deviceManagerUseCase.parseDeviceName(command.request());
        String ipAddress = deviceManagerUseCase.getClientIp(command.request());

        java.util.List<UserSession> existingSessions = userSessionRepository.findAllByDeviceNameAndUserSessionIp(deviceName, ipAddress);
        for (UserSession session : existingSessions) {
            userSessionRepository.delete(session);
        }

        return sessionManager.createNewSession(user, deviceName, ipAddress, command.response());
    }
}