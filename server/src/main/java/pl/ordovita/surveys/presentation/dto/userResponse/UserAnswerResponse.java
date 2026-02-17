package pl.ordovita.surveys.presentation.dto.userResponse;


import pl.ordovita.surveys.application.dto.UserAnswer;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record UserAnswerResponse(Set<UserAnswer> userAnswerSet , UUID userResponseId, Instant createdAt) {
}
