package pl.ordovita.identity.application.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.ordovita.identity.application.port.in.DeviceManagerUseCase;
import pl.ordovita.identity.application.port.in.RemindPasswordUseCase;
import pl.ordovita.identity.application.port.out.PasswordHasher;
import pl.ordovita.identity.domain.exception.PasswordRestartException;
import pl.ordovita.identity.domain.exception.UserException;
import pl.ordovita.identity.domain.model.passwordRestart.PasswordRestart;
import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.identity.domain.model.user.RawPassword;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.port.PasswordRestartRepository;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.shared.domain.event.DomainEventPublisher;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class RemindPasswordService implements RemindPasswordUseCase {

    private final UserRepository userRepository;
    private final PasswordRestartRepository passwordRestartRepository;
    private final DomainEventPublisher domainEventPublisher;
    private final PasswordHasher passwordHasher;
    private final DeviceManagerUseCase deviceManagerUseCase;

    @Override
    @Transactional
    public RemindPasswordRequestResult createRemindPasswordRequest(RemindPasswordRequestCommand command, HttpServletRequest request) {
        Email email = new Email(command.email());
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UserException("User not found"));
        String ipAddress = deviceManagerUseCase.getClientIp(request);

        PasswordRestart passwordRestart = PasswordRestart.create(user.getHashedPassword(),user.getId(),user.getEmail(),ipAddress);

        passwordRestartRepository.save(passwordRestart);

        passwordRestart.publish(domainEventPublisher);

        return new RemindPasswordRequestResult(passwordRestart.getToken(),user.getId().value(),passwordRestart.getId().value());
    }

    @Override
    @Transactional
    public RemindPasswordResult remindPassword(RemindPasswordCommand command, HttpServletRequest request) {
        Email email = new Email(command.email());
        RawPassword rawPassword = new RawPassword(command.rawPassword());

        String ipAddress = deviceManagerUseCase.getClientIp(request);
        String device = deviceManagerUseCase.parseDeviceName(request);

        User user = userRepository.findByEmail(email).orElseThrow(() -> new UserException("User not found"));
        PasswordRestart passwordRestart = passwordRestartRepository.findByToken(command.token()).orElseThrow(() -> new PasswordRestartException("Token not found"));

        if(!passwordRestart.canRestart(command.token())) throw new PasswordRestartException("Token is expired");

        passwordRestart.restart(rawPassword,passwordHasher);

        user.remindPassword(rawPassword, passwordHasher);
        user.passwordChanged(device,ipAddress);
        user.userDataUpdated();

        userRepository.save(user);

        user.publish(domainEventPublisher);

        passwordRestartRepository.save(passwordRestart);

        return new RemindPasswordResult(Instant.now(), user.getId().value());
    }
}
