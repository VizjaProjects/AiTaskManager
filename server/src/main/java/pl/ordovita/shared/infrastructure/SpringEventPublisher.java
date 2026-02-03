package pl.ordovita.shared.infrastructure;

import lombok.AllArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import pl.ordovita.shared.domain.event.DomainEvent;
import pl.ordovita.shared.domain.event.DomainEventPublisher;

@Component
@AllArgsConstructor
public class SpringEventPublisher implements DomainEventPublisher {

    private final ApplicationEventPublisher springPublisher;

    @Override
    public void publish(DomainEvent event) {
        springPublisher.publishEvent(event);
    }
}
