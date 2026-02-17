package pl.ordovita.surveys.presentation.dto.userResponse;


import pl.ordovita.surveys.application.dto.UserAnswer;

import java.util.Set;

public record UserResponseRequest(Set<UserAnswer> answerSet) {
}
