package pl.ordovita.shared.application.listener;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import pl.ordovita.identity.domain.event.EmailVerificationRequestedEvent;
import pl.ordovita.notifications.domain.MailSender;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailVerificationListenerTest {

    @Mock
    private MailSender mailSender;

    @InjectMocks
    private EmailVerificationListener emailVerificationListener;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailVerificationListener, "emailPath", "classpath:templates/identity");
        when(mailSender.escapeHtml(anyString())).thenAnswer(invocation -> invocation.getArgument(0));
        when(mailSender.loadResourceAsString(anyString())).thenReturn("Template: {{email}} {{code}} {{createdTime}}");
    }

    @Test
    @DisplayName("Should handle email verification requested event")
    void shouldHandleEmailVerificationRequestedEvent() {
        EmailVerificationRequestedEvent event = new EmailVerificationRequestedEvent(
                UUID.randomUUID(),
                "test@example.com",
                "Test User",
                "123456",
                Instant.now()
        );

        emailVerificationListener.handle(event);

        verify(mailSender).send(eq("test@example.com"), anyString(), anyString());
    }

    @Test
    @DisplayName("Should send email with verification code")
    void shouldSendEmailWithVerificationCode() {
        EmailVerificationRequestedEvent event = new EmailVerificationRequestedEvent(
                UUID.randomUUID(),
                "test@example.com",
                "Test User",
                "123456",
                Instant.now()
        );

        emailVerificationListener.handle(event);

        verify(mailSender).loadResourceAsString(anyString());
        verify(mailSender).send(anyString(), anyString(), anyString());
    }
}
