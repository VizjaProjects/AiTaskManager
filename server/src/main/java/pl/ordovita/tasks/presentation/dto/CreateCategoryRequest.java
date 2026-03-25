package pl.ordovita.tasks.presentation.dto;

import lombok.NonNull;

public record CreateCategoryRequest(@NonNull String name, @NonNull String color) {
}
