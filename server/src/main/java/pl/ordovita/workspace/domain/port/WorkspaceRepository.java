package pl.ordovita.workspace.domain.port;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.workspace.domain.model.Workspace;
import pl.ordovita.workspace.domain.model.WorkspaceId;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface WorkspaceRepository {
    Workspace save(Workspace workspace);
    Optional<Workspace> findById(WorkspaceId id);
    Set<Workspace> findAllByCreatedBy(UserId id);
    void delete(Workspace workspace);
}
