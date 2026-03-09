package pl.ordovita.surveys.presentation.dto.survey;

import lombok.NonNull;

public record EditSurveyRequest(@NonNull String title, @NonNull String description) {
}
