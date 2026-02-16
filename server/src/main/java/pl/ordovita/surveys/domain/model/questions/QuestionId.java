package pl.ordovita.surveys.domain.model.questions;

import java.util.UUID;

public record QuestionId(UUID value) {

    public static QuestionId generate() {
        return new QuestionId(UUID.randomUUID());
    }
}
