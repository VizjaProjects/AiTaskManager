package pl.ordovita.workspace.domain.model;

import java.util.UUID;

public record WorkspaceId(UUID value) {

    public static WorkspaceId generate() {
        return new WorkspaceId(UUID.randomUUID());
    }
}
