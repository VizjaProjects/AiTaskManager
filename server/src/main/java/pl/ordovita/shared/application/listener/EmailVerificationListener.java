package pl.ordovita.shared.application.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import pl.ordovita.identity.domain.event.EmailVerificationRequestedEvent;
import pl.ordovita.notifications.domain.MailSender;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailVerificationListener {

    private final MailSender mailSender;

    @Value("${path.email-template}")
    private String emailPath;

    @Async
    @TransactionalEventListener
    public void handle(EmailVerificationRequestedEvent event) {

        log.info("Email verification handle");

        String subject = "Twoje konto zostało założone";

        String safeEmail = mailSender.escapeHtml(event.email());
        String safeCode = mailSender.escapeHtml(event.verificationCode());
        String createdTime = mailSender.escapeHtml(event.getCreatedAt().toString());

        String template = mailSender.loadResourceAsString(emailPath+"/registered-verification-email.html").replace("{{email}}", safeEmail).replace(
                "{{code}}",
                safeCode).replace("{{createdTime}}", createdTime);

        mailSender.send(safeEmail, subject, template);

    }
}
