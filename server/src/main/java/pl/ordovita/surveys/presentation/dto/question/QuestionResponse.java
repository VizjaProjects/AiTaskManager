package pl.ordovita.surveys.presentation.dto.question;

import java.time.Instant;
import java.util.UUID;

public record QuestionResponse(UUID questionId, UUID surveyId, Instant createdAt) {
}
