package pl.ordovita.surveys.application.dto;

import pl.ordovita.surveys.domain.model.questions.QuestionType;

import java.util.UUID;

public record QuestionsResult(UUID questionId, String questionText, QuestionType questionType, String hint) {
}
