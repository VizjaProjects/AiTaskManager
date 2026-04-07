package pl.ordovita.tasks.domain.port;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.tasks.domain.model.aiStatistic.AiStatistic;
import pl.ordovita.tasks.domain.model.aiStatistic.AiStatisticId;

import java.util.List;
import java.util.Optional;

public interface AiStatisticRepository {
    AiStatistic save(AiStatistic aiStatistic);
    Optional<AiStatistic> findById(AiStatisticId id);
    List<AiStatistic> findAllByUserId(UserId userId);
    void delete(AiStatistic aiStatistic);
}
