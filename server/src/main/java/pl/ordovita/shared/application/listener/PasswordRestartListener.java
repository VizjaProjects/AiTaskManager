package pl.ordovita.shared.application.listener;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import pl.ordovita.identity.application.port.in.EmailVerificationUseCase;
import pl.ordovita.identity.domain.event.PasswordChangedEvent;
import pl.ordovita.identity.domain.event.RemindPasswordEvent;
import pl.ordovita.identity.domain.event.UserRegisteredEvent;
import pl.ordovita.notifications.domain.MailSender;

@Slf4j
@Component
@RequiredArgsConstructor
public class PasswordRestartListener {

    private final MailSender mailSender;

    @Value("${path.email-template}")
    private String emailPath;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(RemindPasswordEvent event) {
        log.info("User remind password event handle");

        String subject = "Kod weryfikacyjny do zmiany twojego hasła";

        String safeCode = mailSender.escapeHtml(event.token().toString());
        String safeExpiredAtTime = mailSender.escapeHtml(event.createdAt().toString());
        String safeIp = mailSender.escapeHtml(event.ipAddress());
        String safeEmail = mailSender.escapeHtml(event.email().value());

        String template = mailSender.loadResourceAsString(emailPath+"/remind-password-email.html")
                .replace("{{code}}", safeCode)
                .replace("{{createdTime}}", safeExpiredAtTime)
                .replace("{{userIP}}", safeIp)
                .replace("{{email}}", safeEmail);

        mailSender.send(event.email().value(),subject,template);

    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(PasswordChangedEvent event) {
        log.info("User changed password event handle");

        String subject = "Twoje hasło do Ordovita zostało zmienione";

        String safeEmail = mailSender.escapeHtml(event.email().value());
        String safeWhen = mailSender.escapeHtml(event.when().toString());
        String safeDevice = mailSender.escapeHtml(event.device());
        String safeIp = mailSender.escapeHtml(event.ipAddress());

        String template = mailSender.loadResourceAsString(emailPath+"/changed-password.html")
                .replace("{{email}}", safeEmail)
                .replace("{{time}}", safeWhen)
                .replace("{{device}}", safeDevice)
                .replace("{{ipAddres}}", safeIp);

        mailSender.send(event.email().value(),subject,template);

    }
}
