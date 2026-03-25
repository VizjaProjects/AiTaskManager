package pl.ordovita.tasks.domain.port;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.tasks.domain.model.status.TaskStatus;
import pl.ordovita.tasks.domain.model.status.TaskStatusId;

import java.util.List;
import java.util.Optional;

public interface TaskStatusRepository {
    TaskStatus save(TaskStatus status);
    Optional<TaskStatus> findById(TaskStatusId id);
    List<TaskStatus> findAllByUserId(UserId userId);
    List<TaskStatus> findAll();
    void delete(TaskStatus status);
}
