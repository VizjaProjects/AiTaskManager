package pl.ordovita.tasks.application.port.in;

import java.time.Instant;
import java.util.UUID;

public interface CreateCategoryUseCase {

    record CreateCategoryCommand(String name, String color) {}
    record CreateCategoryResult(UUID categoryId, Instant createdAt) {}

    CreateCategoryResult createCategory(CreateCategoryCommand command);
}
