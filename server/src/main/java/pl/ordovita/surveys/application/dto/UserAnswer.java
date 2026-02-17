package pl.ordovita.surveys.application.dto;


import java.util.UUID;

public record UserAnswer(UUID questionId, String answer) {
}
