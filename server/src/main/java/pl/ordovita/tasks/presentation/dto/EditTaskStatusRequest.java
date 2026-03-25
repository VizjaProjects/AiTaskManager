package pl.ordovita.tasks.presentation.dto;

import lombok.NonNull;

public record EditTaskStatusRequest(@NonNull String name, @NonNull String color) {
}
