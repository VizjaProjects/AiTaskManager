package pl.ordovita.surveys.application.port.in;

import pl.ordovita.surveys.domain.model.questions.QuestionType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface CreateQuestionSurveyUseCase {

    record CreateQuestionSurveyCommand(String questionText, UUID surveyUUID, QuestionType questionType, List<String> optionTextValue, boolean isRequired, String hint){}
    record CreateQuestionSurveyResult(UUID surveyId, UUID questionId, Instant createdAt){}

    CreateQuestionSurveyResult create(CreateQuestionSurveyCommand command);
}
