package pl.ordovita.surveys.domain.model.questionOption;

import java.util.UUID;

public record QuestionOptionId(UUID value) {

    public static QuestionOptionId generate() {
        return new QuestionOptionId(UUID.randomUUID());
    }
}
