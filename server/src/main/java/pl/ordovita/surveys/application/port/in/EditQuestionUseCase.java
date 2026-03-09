package pl.ordovita.surveys.application.port.in;

import pl.ordovita.surveys.domain.model.questions.QuestionType;

import java.time.Instant;
import java.util.UUID;

public interface EditQuestionUseCase {

    record EditQuestionCommand(UUID questionId, String questionText, QuestionType questionType, boolean isRequired){}
    record EditQuestionResult(UUID questionId, Instant updatedAt){}

    EditQuestionResult edit(EditQuestionCommand command);
}
