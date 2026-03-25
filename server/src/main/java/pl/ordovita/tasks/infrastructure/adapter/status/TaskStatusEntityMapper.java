package pl.ordovita.tasks.infrastructure.adapter.status;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.infrastructure.jpa.user.UserEntity;
import pl.ordovita.tasks.domain.model.status.TaskStatus;
import pl.ordovita.tasks.domain.model.status.TaskStatusId;
import pl.ordovita.tasks.infrastructure.jpa.status.TaskStatusEntity;

public class TaskStatusEntityMapper {

    public static TaskStatusEntity from(TaskStatus status) {
        UserEntity userEntity = new UserEntity();
        userEntity.setId(status.getUserId().value());

        return new TaskStatusEntity(
                status.getId().value(),
                status.getName(),
                status.getColor(),
                userEntity,
                status.getCreatedAt(),
                status.getUpdatedAt()
        );
    }

    public static TaskStatus toDomain(TaskStatusEntity entity) {
        return new TaskStatus(
                new TaskStatusId(entity.getId()),
                entity.getName(),
                entity.getColor(),
                new UserId(entity.getUserId().getId()),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
