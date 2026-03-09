package pl.ordovita.surveys.application.port.in;

import java.time.Instant;
import java.util.UUID;

public interface DeleteQuestionOptionUseCase {

    record DeleteQuestionOptionCommand(UUID questionOptionId) {}
    record DeleteQuestionOptionResult(UUID questionOptionId, Instant updatedAt) {}

    DeleteQuestionOptionResult delete(DeleteQuestionOptionCommand command);
}
