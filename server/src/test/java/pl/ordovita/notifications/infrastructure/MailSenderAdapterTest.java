package pl.ordovita.notifications.infrastructure;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ResourceLoader;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MailSenderAdapterTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private ResourceLoader resourceLoader;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private MailSenderAdapter mailSenderAdapter;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(mailSenderAdapter, "username", "noreply@example.com");
    }

    @Test
    @DisplayName("Should send email successfully")
    void shouldSendEmailSuccessfully() throws MessagingException {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        String toEmail = "test@example.com";
        String subject = "Test Subject";
        String body = "<html><body>Test Body</body></html>";

        mailSenderAdapter.send(toEmail, subject, body);

        verify(mailSender).createMimeMessage();
        verify(mailSender).send(mimeMessage);
    }

    @Test
    @DisplayName("Should throw exception when sending email fails")
    void shouldThrowExceptionWhenSendingEmailFails() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new RuntimeException("Mail send failed")).when(mailSender).send(any(MimeMessage.class));

        String toEmail = "test@example.com";
        String subject = "Test Subject";
        String body = "<html><body>Test Body</body></html>";

        assertThrows(RuntimeException.class, () -> mailSenderAdapter.send(toEmail, subject, body));
    }
}
