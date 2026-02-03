package pl.ordovita.identity.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.ordovita.identity.application.exception.RegisterException;
import pl.ordovita.identity.application.port.in.EmailVerificationUseCase;
import pl.ordovita.identity.application.port.in.VerificationAccountUseCase;
import pl.ordovita.identity.domain.exception.EmailVerificationException;
import pl.ordovita.identity.domain.exception.UserException;
import pl.ordovita.identity.domain.model.emailVerification.EmailVerification;
import pl.ordovita.identity.domain.model.emailVerification.VerificationCode;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.domain.port.EmailVerificationRepository;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.shared.domain.event.DomainEventPublisher;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerificationService implements EmailVerificationUseCase, VerificationAccountUseCase {

    private final EmailVerificationRepository emailVerificationRepository;
    private final UserRepository userRepository;
    private final DomainEventPublisher domainEventPublisher;


    @Transactional
    @Override
    public EmailVerificationResult executeEmailVerification(EmailVerificationCommand command) {
        User user = getUser(command.userId());

        if (user.isEmailVerified()) throw new RegisterException("Email already verified");

        EmailVerification emailVerification = EmailVerification.create(user.getId(),
                user.getEmail(),
                user.getFullName());

        emailVerificationRepository.save(emailVerification);

        emailVerification.publish(domainEventPublisher);


        return new EmailVerificationResult(user.getId().value(), user.getEmail().value());
    }

    @Override
    public VerificationAccountResult verify(VerificationAccountCommand command) {
        User user = getUser(command.userId());
        VerificationCode code = new VerificationCode(command.code());
        EmailVerification emailVerification = emailVerificationRepository.findByUserIdAndCode(user.getId(),
                code).orElseThrow(() -> new EmailVerificationException("Email verification code not found"));

        emailVerification.verify(code);

        user.verifyEmail();

        emailVerificationRepository.save(emailVerification);
        userRepository.save(user);

        return new VerificationAccountResult(user.getId().value(), user.getFullName(), user.getEmail().value(), command.code());

    }

    private User getUser(UUID uuid) {
        UserId userId = new UserId(uuid);
        return userRepository.findById(userId).orElseThrow(() -> new UserException("User not found"));
    }
}
