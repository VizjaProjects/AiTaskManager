package pl.ordovita.tasks.application.port.in;

import java.time.Instant;
import java.util.UUID;

public interface EditCategoryUseCase {

    record EditCategoryCommand(UUID categoryId, String name, String color) {}
    record EditCategoryResult(UUID categoryId, String name, String color, Instant updatedAt) {}

    EditCategoryResult editCategory(EditCategoryCommand command);
}
