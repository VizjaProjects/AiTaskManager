package pl.ordovita.workspace.domain.event;

import pl.ordovita.shared.domain.event.DomainEvent;

import java.time.Instant;
import java.util.UUID;

public record WorkspaceRemoveUserEvent(
        UUID workspaceId,
        UUID addedUserId,
        Instant occurredAt
) implements DomainEvent {

    public WorkspaceRemoveUserEvent(UUID workspaceId, UUID addedUserId) {
        this(workspaceId,addedUserId,Instant.now());
    }

    @Override
    public Instant getCreatedAt() {
        return occurredAt;
    }
}
