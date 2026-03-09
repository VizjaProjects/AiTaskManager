package pl.ordovita.surveys.application.dto;

import java.util.UUID;

public record QuestionOptionsResult(UUID questionOptionId, String optionText) {
}
