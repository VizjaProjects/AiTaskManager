package pl.ordovita.shared.application.listener;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import pl.ordovita.identity.domain.event.PasswordChangedEvent;
import pl.ordovita.identity.domain.event.RemindPasswordEvent;
import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.notifications.domain.MailSender;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordRestartListenerTest {

    @Mock
    private MailSender mailSender;

    @InjectMocks
    private PasswordRestartListener passwordRestartListener;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(passwordRestartListener, "emailPath", "classpath:templates/identity");
        when(mailSender.escapeHtml(anyString())).thenAnswer(invocation -> invocation.getArgument(0));
        when(mailSender.loadResourceAsString(anyString())).thenReturn("Template: {{code}} {{createdTime}} {{userIP}} {{email}}");
    }

    @Test
    @DisplayName("Should handle remind password event")
    void shouldHandleRemindPasswordEvent() {
        RemindPasswordEvent event = new RemindPasswordEvent(
                new Email("test@example.com"),
                UUID.randomUUID(),
                Instant.now(),
                Instant.now(),
                "192.168.1.1"
        );

        passwordRestartListener.handle(event);

        verify(mailSender).send(eq("test@example.com"), anyString(), anyString());
    }

    @Test
    @DisplayName("Should handle password changed event")
    void shouldHandlePasswordChangedEvent() {
        PasswordChangedEvent event = new PasswordChangedEvent(
                new Email("test@example.com"),
                Instant.now(),
                "Chrome on Windows",
                "192.168.1.1"
        );

        when(mailSender.loadResourceAsString(anyString())).thenReturn("Template: {{email}} {{time}} {{device}} {{ipAddres}}");

        passwordRestartListener.handle(event);

        verify(mailSender).send(eq("test@example.com"), anyString(), anyString());
    }

    @Test
    @DisplayName("Should load correct email template for remind password")
    void shouldLoadCorrectEmailTemplateForRemindPassword() {
        RemindPasswordEvent event = new RemindPasswordEvent(
                new Email("test@example.com"),
                UUID.randomUUID(),
                Instant.now(),
                Instant.now(),
                "192.168.1.1"
        );

        passwordRestartListener.handle(event);

        verify(mailSender).loadResourceAsString(anyString());
    }

    @Test
    @DisplayName("Should load correct email template for password changed")
    void shouldLoadCorrectEmailTemplateForPasswordChanged() {
        PasswordChangedEvent event = new PasswordChangedEvent(
                new Email("test@example.com"),
                Instant.now(),
                "Chrome on Windows",
                "192.168.1.1"
        );

        when(mailSender.loadResourceAsString(anyString())).thenReturn("Template: {{email}} {{time}} {{device}} {{ipAddres}}");

        passwordRestartListener.handle(event);

        verify(mailSender).loadResourceAsString(anyString());
    }
}
