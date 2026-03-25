package pl.ordovita.tasks.application.port.in;

import java.util.UUID;

public interface DeleteCategoryUseCase {

    record DeleteCategoryCommand(UUID categoryId) {}

    void deleteCategory(DeleteCategoryCommand command);
}
