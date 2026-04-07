package pl.ordovita.tasks.application.port.in;

import java.util.UUID;

public interface DeleteAiStatisticUseCase {
    record DeleteAiStatisticCommand(UUID aiStatisticId) {}
    void deleteAiStatistic(DeleteAiStatisticCommand command);
}
