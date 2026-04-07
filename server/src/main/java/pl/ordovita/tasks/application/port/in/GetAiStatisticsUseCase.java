package pl.ordovita.tasks.application.port.in;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface GetAiStatisticsUseCase {
    record AiStatisticResult(UUID aiStatisticId, String promptText, int inputTokens,
                             UUID userId, Instant createdAt) {}
    record GetUserAiStatisticsResult(List<AiStatisticResult> statistics) {}
    GetUserAiStatisticsResult getUserAiStatistics();
}
