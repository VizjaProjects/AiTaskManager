package pl.ordovita.tasks.domain.port;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.tasks.domain.model.category.CategoryId;
import pl.ordovita.tasks.domain.model.category.TaskCategory;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository {
    TaskCategory save(TaskCategory category);
    Optional<TaskCategory> findById(CategoryId id);
    List<TaskCategory> findAllByUserId(UserId userId);
    List<TaskCategory> findAll();
    void delete(TaskCategory category);
    int count(UserId userId);
}
