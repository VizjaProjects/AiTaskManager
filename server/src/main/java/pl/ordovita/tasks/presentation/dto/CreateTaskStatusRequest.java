package pl.ordovita.tasks.presentation.dto;

import lombok.NonNull;

public record CreateTaskStatusRequest(@NonNull String name, @NonNull String color) {
}
