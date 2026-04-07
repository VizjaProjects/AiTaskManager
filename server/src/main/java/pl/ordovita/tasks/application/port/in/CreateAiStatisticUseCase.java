package pl.ordovita.tasks.application.port.in;

import java.time.Instant;
import java.util.UUID;

public interface CreateAiStatisticUseCase {
    record CreateAiStatisticCommand(String promptText, int inputTokens) {}
    record CreateAiStatisticResult(UUID aiStatisticId, Instant createdAt) {}
    CreateAiStatisticResult createAiStatistic(CreateAiStatisticCommand command);
}
