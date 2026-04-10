package pl.ordovita.identity.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.ordovita.identity.application.port.in.DeviceManagerUseCase;
import pl.ordovita.identity.application.port.in.LoginUseCase;
import pl.ordovita.identity.application.port.in.OAuth2LoginUseCase;
import pl.ordovita.identity.domain.model.token.TokenPair;
import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.model.userSession.UserSession;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.identity.domain.port.UserSessionRepository;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class OAuth2LoginService implements OAuth2LoginUseCase {

    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;
    private final SessionManager sessionManager;
    private final DeviceManagerUseCase deviceManagerUseCase;

    @Override
    public OAuth2LoginResult loginWithOAuth2(OAuth2LoginCommand command) {
        Email email = new Email(command.email());

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = User.createOAuthUser(command.fullName(), email);
                    return userRepository.save(newUser);
                });

        if (!user.canLogin()) {
            user.verifyEmail();
            userRepository.save(user);
        }

        user.login();
        userRepository.save(user);

        String deviceName = deviceManagerUseCase.parseDeviceName(command.request());
        String ipAddress = deviceManagerUseCase.getClientIp(command.request());

        List<UserSession> existingSessions = userSessionRepository.findAllByDeviceNameAndUserSessionIp(deviceName, ipAddress);
        for (UserSession session : existingSessions) {
            userSessionRepository.delete(session);
        }

        TokenPair tokenPair = sessionManager.createNewSession(user, deviceName, ipAddress, command.response());

        LoginUseCase.UserInfo userInfo = new LoginUseCase.UserInfo(
                user.getId().value(),
                user.getEmail().value(),
                user.getFullName(),
                user.getRole()
        );

        return new OAuth2LoginResult(tokenPair, userInfo);
    }
}
