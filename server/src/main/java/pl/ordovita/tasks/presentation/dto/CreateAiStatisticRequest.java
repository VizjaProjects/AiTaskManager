package pl.ordovita.tasks.presentation.dto;

import lombok.NonNull;

public record CreateAiStatisticRequest(@NonNull String promptText, int inputTokens) {
}
