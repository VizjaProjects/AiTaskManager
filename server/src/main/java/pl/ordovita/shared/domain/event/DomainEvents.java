package pl.ordovita.shared.domain.event;

public class DomainEvents {

    private static DomainEventPublisher publisher;

    public static void setPublisher(DomainEventPublisher publisher) {
        DomainEvents.publisher = publisher;
    }

    public static void publish(DomainEvent event) {
        if (publisher == null) {
            throw new IllegalStateException("DomainEventPublisher not initialized");
        }
        publisher.publish(event);
    }
}
