package pl.ordovita.shared.infrastructure;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import pl.ordovita.identity.domain.event.UserRegisteredEvent;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class SpringEventPublisherTest {

    @Mock
    private ApplicationEventPublisher springPublisher;

    @InjectMocks
    private SpringEventPublisher eventPublisher;

    @Test
    @DisplayName("Should publish event successfully")
    void shouldPublishEventSuccessfully() {
        UserRegisteredEvent event = new UserRegisteredEvent(UUID.randomUUID(), "test@example.com", "Test User");

        eventPublisher.publish(event);

        verify(springPublisher).publishEvent(event);
    }

    @Test
    @DisplayName("Should delegate to Spring ApplicationEventPublisher")
    void shouldDelegateToSpringApplicationEventPublisher() {
        UserRegisteredEvent event = new UserRegisteredEvent(UUID.randomUUID(), "test@example.com", "Test User");

        eventPublisher.publish(event);

        verify(springPublisher).publishEvent(any(UserRegisteredEvent.class));
    }
}
