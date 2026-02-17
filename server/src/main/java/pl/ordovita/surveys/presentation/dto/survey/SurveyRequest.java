package pl.ordovita.surveys.presentation.dto.survey;

import lombok.NonNull;

public record SurveyRequest(@NonNull String title, @NonNull String description) {
}
