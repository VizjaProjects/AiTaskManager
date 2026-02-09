package pl.ordovita.identity.application.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.ordovita.identity.application.port.in.ChangePasswordUseCase;
import pl.ordovita.identity.application.port.in.DeviceManagerUseCase;
import pl.ordovita.identity.application.port.out.PasswordHasher;
import pl.ordovita.identity.domain.exception.UserException;
import pl.ordovita.identity.domain.model.user.RawPassword;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.port.CurrentUser;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.shared.domain.event.DomainEventPublisher;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ChangePasswordService implements ChangePasswordUseCase {

    private final UserRepository userRepository;
    private final PasswordHasher passwordHasher;
    private final DomainEventPublisher domainEventPublisher;
    private final CurrentUser currentUser;
    private final DeviceManagerUseCase deviceManagerUseCase;

    @Override
    @Transactional
    public ChangePasswordResult change(ChangePasswordCommand command, HttpServletRequest httpServletRequest) {
        RawPassword oldPassword = new RawPassword(command.oldPassword());
        RawPassword newPassword = new RawPassword(command.newPassword());
        RawPassword confirmPassword = new RawPassword(command.confirmPassword());
        String ipAddress = deviceManagerUseCase.getClientIp(httpServletRequest);
        String device = deviceManagerUseCase.parseDeviceName(httpServletRequest);

        User user = userRepository.findById(currentUser.requireAuthenticated().id()).orElseThrow(() -> new UserException("User not found"));

        user.changePassword(oldPassword,newPassword,confirmPassword,passwordHasher);
        user.passwordChanged(ipAddress,device);
        user.userDataUpdated();

        userRepository.save(user);

        user.publish(domainEventPublisher);


        return new ChangePasswordResult(user.getId().value(), Instant.now());
    }
}
