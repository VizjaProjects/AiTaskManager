package pl.ordovita.surveys.presentation.dto.survey;

import java.time.Instant;
import java.util.UUID;

public record SurveyResponse(UUID surveyId, Instant createdAt) {
}
