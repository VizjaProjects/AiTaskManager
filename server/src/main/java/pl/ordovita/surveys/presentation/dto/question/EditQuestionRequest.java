package pl.ordovita.surveys.presentation.dto.question;

import pl.ordovita.surveys.domain.model.questions.QuestionType;

public record EditQuestionRequest(String questionText, QuestionType questionType, boolean isRequired, String hint) {
}
