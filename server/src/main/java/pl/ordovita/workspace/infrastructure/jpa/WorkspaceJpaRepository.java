package pl.ordovita.workspace.infrastructure.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.ordovita.identity.domain.model.user.UserId;

import java.util.List;
import java.util.UUID;

public interface WorkspaceJpaRepository  extends JpaRepository<WorkspaceEntity, UUID> {

    List<WorkspaceEntity> findAllByCreatedBy(UserId id);
}
