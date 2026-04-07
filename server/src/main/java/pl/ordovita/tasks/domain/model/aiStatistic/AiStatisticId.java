package pl.ordovita.tasks.domain.model.aiStatistic;

import java.util.UUID;

public record AiStatisticId(UUID value) {

    public static AiStatisticId generate() {
        return new AiStatisticId(UUID.randomUUID());
    }
}
