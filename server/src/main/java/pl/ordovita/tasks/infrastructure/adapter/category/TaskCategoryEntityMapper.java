package pl.ordovita.tasks.infrastructure.adapter.category;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.infrastructure.jpa.user.UserEntity;
import pl.ordovita.tasks.domain.model.category.CategoryId;
import pl.ordovita.tasks.domain.model.category.TaskCategory;
import pl.ordovita.tasks.infrastructure.jpa.category.TaskCategoryEntity;

public class TaskCategoryEntityMapper {

    public static TaskCategoryEntity from(TaskCategory category) {
        UserEntity userEntity = new UserEntity();
        userEntity.setId(category.getUserId().value());

        return new TaskCategoryEntity(
                category.getId().value(),
                category.getName(),
                category.getColor(),
                userEntity,
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }

    public static TaskCategory toDomain(TaskCategoryEntity entity) {
        return new TaskCategory(
                new CategoryId(entity.getId()),
                entity.getName(),
                entity.getColor(),
                new UserId(entity.getUserId().getId()),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
