package pl.ordovita.surveys.presentation.dto.userResponse;


import pl.ordovita.surveys.application.dto.UserAnswer;

import java.util.Set;
import java.util.UUID;

public record UserResponseRequest(UUID questionId, String answer) {
}
