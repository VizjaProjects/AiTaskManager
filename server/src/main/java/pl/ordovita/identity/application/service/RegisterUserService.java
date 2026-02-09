package pl.ordovita.identity.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.ordovita.identity.application.exception.RegisterException;
import pl.ordovita.identity.application.port.in.RegisterUserUseCase;
import pl.ordovita.identity.application.port.out.PasswordHasher;
import pl.ordovita.identity.domain.event.UserRegisteredEvent;
import pl.ordovita.identity.domain.model.passwordRestart.PasswordRestart;
import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.identity.domain.model.user.RawPassword;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.port.PasswordRestartRepository;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.shared.domain.event.DomainEventPublisher;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class RegisterUserService implements RegisterUserUseCase {

    private final UserRepository userRepository;
    private final PasswordHasher passwordHasher;
    private final DomainEventPublisher domainEventPublisher;


    @Override
    public RegisterUserResult register(RegisterUserCommand command) {
        Email email = new Email(command.email());
        RawPassword rawPassword = new RawPassword(command.rawPassword());
        User user = User.createUser(command.fullName(), email, rawPassword, passwordHasher);

        if (userRepository.findByEmail(email).isPresent()) throw new RegisterException("Email already exists");
        log.debug(String.valueOf(userRepository.findByEmail(email).isPresent()));
        if (user.isEmailVerified()) throw new RegisterException("Email already verified");

        userRepository.save(user);

        user.publish(domainEventPublisher);


        return new RegisterUserResult(user.getId().value(), user.getEmail().value());

    }


}
