package pl.ordovita.surveys.application.port.in;

import pl.ordovita.surveys.domain.model.questions.Question;

import java.time.Instant;
import java.util.UUID;

public interface DeleteQuestionUseCase {

    record DeleteQuestionCommand(UUID questionId){}
    record DeleteQuestionResult(UUID questionId, Instant updatedAt){}

    DeleteQuestionResult deleteQuestion(DeleteQuestionCommand command);
}
