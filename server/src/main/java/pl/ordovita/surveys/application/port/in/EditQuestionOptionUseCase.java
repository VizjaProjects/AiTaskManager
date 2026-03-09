package pl.ordovita.surveys.application.port.in;

import pl.ordovita.surveys.domain.model.questionOption.QuestionOptionId;

import java.time.Instant;
import java.util.UUID;

public interface EditQuestionOptionUseCase {

    record EditQuestionOptionCommand(UUID questionOptionId, String optionText){}
    record EditQuestionOptionResult(UUID questionOptionId, String optionText, Instant updatedAt){}

    EditQuestionOptionResult edit(EditQuestionOptionCommand command);
}
