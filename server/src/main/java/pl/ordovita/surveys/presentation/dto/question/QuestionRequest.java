package pl.ordovita.surveys.presentation.dto.question;

import lombok.NonNull;
import pl.ordovita.surveys.domain.model.questions.QuestionType;

import java.util.List;


public record QuestionRequest(@NonNull String questionText, @NonNull  QuestionType questionType, @NonNull  List<String> optionTextValue, boolean isRequired) {
}
