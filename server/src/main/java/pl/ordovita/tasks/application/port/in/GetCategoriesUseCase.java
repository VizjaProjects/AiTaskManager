package pl.ordovita.tasks.application.port.in;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface GetCategoriesUseCase {

    record CategoryResult(UUID categoryId, String name, String color, UUID userId, Instant createdAt, Instant updatedAt) {}
    record GetAllCategoriesResult(List<CategoryResult> categories) {}
    record GetUserCategoriesResult(List<CategoryResult> categories) {}

    GetAllCategoriesResult getAllCategories();
    GetUserCategoriesResult getUserCategories();
}
