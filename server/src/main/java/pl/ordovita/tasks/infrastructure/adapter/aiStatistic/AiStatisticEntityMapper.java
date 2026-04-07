package pl.ordovita.tasks.infrastructure.adapter.aiStatistic;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.infrastructure.jpa.user.UserEntity;
import pl.ordovita.tasks.domain.model.aiStatistic.AiStatistic;
import pl.ordovita.tasks.domain.model.aiStatistic.AiStatisticId;
import pl.ordovita.tasks.infrastructure.jpa.aiStatistic.AiStatisticEntity;

public class AiStatisticEntityMapper {

    public static AiStatisticEntity from(AiStatistic statistic) {
        UserEntity userEntity = new UserEntity();
        userEntity.setId(statistic.getUserId().value());
        return new AiStatisticEntity(
                statistic.getId().value(),
                statistic.getPromptText(),
                statistic.getInputTokens(),
                userEntity,
                statistic.getCreatedAt()
        );
    }

    public static AiStatistic toDomain(AiStatisticEntity entity) {
        return new AiStatistic(
                new AiStatisticId(entity.getId()),
                entity.getPromptText(),
                entity.getInputTokens(),
                entity.getCreatedAt(),
                new UserId(entity.getUserId().getId())
        );
    }
}
