package pl.ordovita.shared.domain.event;


public interface DomainEventPublisher {
    void publish(DomainEvent event);
}
