package pl.ordovita.tasks.infrastructure.adapter.task;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.infrastructure.jpa.user.UserEntity;
import pl.ordovita.tasks.domain.model.category.CategoryId;
import pl.ordovita.tasks.domain.model.status.TaskStatusId;
import pl.ordovita.tasks.domain.model.task.Task;
import pl.ordovita.tasks.domain.model.task.TaskId;
import pl.ordovita.tasks.infrastructure.jpa.category.TaskCategoryEntity;
import pl.ordovita.tasks.infrastructure.jpa.status.TaskStatusEntity;
import pl.ordovita.tasks.infrastructure.jpa.task.TaskEntity;

public class TaskEntityMapper {

    public static TaskEntity from(Task task) {
        UserEntity userEntity = new UserEntity();
        userEntity.setId(task.getUserId().value());

        TaskCategoryEntity categoryEntity = null;
        if (task.getCategoryId() != null) {
            categoryEntity = TaskCategoryEntity.builder().id(task.getCategoryId().value()).build();
        }

        TaskStatusEntity statusEntity = TaskStatusEntity.builder().id(task.getStatusId().value()).build();

        return new TaskEntity(
                task.getId().value(),
                task.getTitle(),
                task.getDescription(),
                task.getPriority(),
                categoryEntity,
                task.getEstimatedDuration(),
                task.getDueDateTime(),
                statusEntity,
                task.getSource(),
                userEntity,
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }

    public static Task toDomain(TaskEntity entity) {
        CategoryId categoryId = null;
        if (entity.getCategoryId() != null) {
            categoryId = new CategoryId(entity.getCategoryId().getId());
        }

        return new Task(
                new TaskId(entity.getId()),
                entity.getTitle(),
                entity.getDescription(),
                entity.getPriority(),
                categoryId,
                entity.getEstimatedDuration(),
                entity.getDueDateTime(),
                new TaskStatusId(entity.getStatusId().getId()),
                entity.getSource(),
                new UserId(entity.getUserId().getId()),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
