package pl.ordovita.tasks.infrastructure.adapter.status;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.tasks.domain.model.status.TaskStatus;
import pl.ordovita.tasks.domain.model.status.TaskStatusId;
import pl.ordovita.tasks.domain.port.TaskStatusRepository;
import pl.ordovita.tasks.infrastructure.jpa.status.TaskStatusEntity;
import pl.ordovita.tasks.infrastructure.jpa.status.TaskStatusJpaRepository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class TaskStatusRepositoryAdapter implements TaskStatusRepository {

    private final TaskStatusJpaRepository statusJpaRepository;

    @Override
    public TaskStatus save(TaskStatus status) {
        TaskStatusEntity entity = TaskStatusEntityMapper.from(status);
        return TaskStatusEntityMapper.toDomain(statusJpaRepository.save(entity));
    }

    @Override
    public Optional<TaskStatus> findById(TaskStatusId id) {
        return statusJpaRepository.findById(id.value()).map(TaskStatusEntityMapper::toDomain);
    }

    @Override
    public List<TaskStatus> findAllByUserId(UserId userId) {
        return statusJpaRepository.findAllByUserId(userId.value()).stream().map(TaskStatusEntityMapper::toDomain).toList();
    }

    @Override
    public List<TaskStatus> findAll() {
        return statusJpaRepository.findAll().stream().map(TaskStatusEntityMapper::toDomain).toList();
    }

    @Override
    public void delete(TaskStatus status) {
        statusJpaRepository.delete(TaskStatusEntityMapper.from(status));
    }
}
