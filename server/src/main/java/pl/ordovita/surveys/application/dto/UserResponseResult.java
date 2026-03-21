package pl.ordovita.surveys.application.dto;

import java.util.UUID;

public record UserResponseResult(UUID surveyId, String surveyDescription, UUID questionId, String questionText,
                                 UUID userResponseId, String textAnswer) {
}

