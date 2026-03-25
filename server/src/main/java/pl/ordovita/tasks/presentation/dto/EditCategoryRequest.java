package pl.ordovita.tasks.presentation.dto;

import lombok.NonNull;

public record EditCategoryRequest(@NonNull String name, @NonNull String color) {
}
