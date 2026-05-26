package pl.ordovita.workspace.infrastructure.adapter;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.workspace.domain.model.Workspace;
import pl.ordovita.workspace.domain.model.WorkspaceId;
import pl.ordovita.workspace.domain.port.WorkspaceRepository;
import pl.ordovita.workspace.infrastructure.jpa.WorkspaceEntity;
import pl.ordovita.workspace.infrastructure.jpa.WorkspaceJpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class WorkspaceRepositoryAdapter implements WorkspaceRepository {
    private final WorkspaceJpaRepository workspaceJpaRepository;

    @Override
    public Workspace save(Workspace workspace) {
        WorkspaceEntity entity = WorkspaceEntityMapper.from(workspace);
        WorkspaceEntity saved = workspaceJpaRepository.save(entity);
        return WorkspaceEntityMapper.toDomain(saved);
    }

    @Override
    public Optional<Workspace> findById(WorkspaceId id) {
        return workspaceJpaRepository.findById(id.value()).map(WorkspaceEntityMapper::toDomain);
    }

    @Override
    public Set<Workspace> findAllByCreatedBy(UserId id) {
        return workspaceJpaRepository.findAllByCreatedBy(id).stream().map(WorkspaceEntityMapper::toDomain).collect(
                Collectors.toSet());
    }

    @Override
    public void delete(Workspace workspace) { workspaceJpaRepository.delete(WorkspaceEntityMapper.from(workspace));}
}
