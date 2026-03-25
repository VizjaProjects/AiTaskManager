package pl.ordovita.tasks.infrastructure.adapter.task;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.tasks.domain.model.task.Task;
import pl.ordovita.tasks.domain.model.task.TaskId;
import pl.ordovita.tasks.domain.port.TaskRepository;
import pl.ordovita.tasks.infrastructure.jpa.task.TaskEntity;
import pl.ordovita.tasks.infrastructure.jpa.task.TaskJpaRepository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class TaskRepositoryAdapter implements TaskRepository {

    private final TaskJpaRepository taskJpaRepository;

    @Override
    public Task save(Task task) {
        TaskEntity entity = TaskEntityMapper.from(task);
        return TaskEntityMapper.toDomain(taskJpaRepository.save(entity));
    }

    @Override
    public Optional<Task> findById(TaskId id) {
        return taskJpaRepository.findById(id.value()).map(TaskEntityMapper::toDomain);
    }

    @Override
    public List<Task> findAllByUserId(UserId userId) {
        return taskJpaRepository.findAllByUserId(userId.value()).stream().map(TaskEntityMapper::toDomain).toList();
    }

    @Override
    public void delete(Task task) {
        taskJpaRepository.delete(TaskEntityMapper.from(task));
    }
}
