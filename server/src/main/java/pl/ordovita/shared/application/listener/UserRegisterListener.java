package pl.ordovita.shared.application.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import pl.ordovita.identity.application.port.in.EmailVerificationUseCase;
import pl.ordovita.identity.domain.event.UserRegisteredEvent;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserRegisterListener {

    private final EmailVerificationUseCase emailVerificationUseCase;


    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(UserRegisteredEvent event) {
        log.info("User register event handle");

        emailVerificationUseCase.executeEmailVerification(new EmailVerificationUseCase.EmailVerificationCommand(event.userId()));

    }

}
