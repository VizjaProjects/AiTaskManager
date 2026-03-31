package pl.ordovita.tasks.domain.port;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.tasks.domain.model.task.Task;
import pl.ordovita.tasks.domain.model.task.TaskId;

import java.util.List;
import java.util.Optional;

public interface TaskRepository {
    Task save(Task task);
    Optional<Task> findById(TaskId id);
    List<Task> findAllByUserId(UserId userId);
    List<Task> findAcceptedByUserId(UserId userId);
    List<Task> findPendingByUserId(UserId userId);
    void delete(Task task);
}
