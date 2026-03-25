package pl.ordovita.tasks.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.ordovita.identity.domain.exception.UserException;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.port.CurrentUser;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.tasks.application.port.in.CreateCategoryUseCase;
import pl.ordovita.tasks.application.port.in.DeleteCategoryUseCase;
import pl.ordovita.tasks.application.port.in.EditCategoryUseCase;
import pl.ordovita.tasks.application.port.in.GetCategoriesUseCase;
import pl.ordovita.tasks.domain.exception.CategoryException;
import pl.ordovita.tasks.domain.model.category.CategoryId;
import pl.ordovita.tasks.domain.model.category.TaskCategory;
import pl.ordovita.tasks.domain.port.CategoryRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService implements CreateCategoryUseCase, EditCategoryUseCase, DeleteCategoryUseCase, GetCategoriesUseCase {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    @Override
    public CreateCategoryResult createCategory(CreateCategoryCommand command) {
        User user = userRepository.findById(currentUser.requireAuthenticated().id())
                .orElseThrow(() -> new UserException("User not found"));

        TaskCategory category = TaskCategory.create(command.name(), command.color(), user.getId());
        categoryRepository.save(category);

        return new CreateCategoryResult(category.getId().value(), category.getCreatedAt());
    }

    @Override
    public EditCategoryResult editCategory(EditCategoryCommand command) {
        User user = userRepository.findById(currentUser.requireAuthenticated().id())
                .orElseThrow(() -> new UserException("User not found"));

        CategoryId categoryId = new CategoryId(command.categoryId());
        TaskCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryException("Category with id " + categoryId + " not found"));

        if (!category.getUserId().equals(user.getId())) {
            throw new CategoryException("Category does not belong to current user");
        }

        category.edit(command.name(), command.color());
        TaskCategory updatedCategory = categoryRepository.save(category);

        return new EditCategoryResult(updatedCategory.getId().value(), updatedCategory.getName(),
                updatedCategory.getColor(), updatedCategory.getUpdatedAt());
    }

    @Override
    public void deleteCategory(DeleteCategoryCommand command) {
        User user = userRepository.findById(currentUser.requireAuthenticated().id())
                .orElseThrow(() -> new UserException("User not found"));

        CategoryId categoryId = new CategoryId(command.categoryId());
        TaskCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new CategoryException("Category with id " + categoryId + " not found"));

        if (!category.getUserId().equals(user.getId())) {
            throw new CategoryException("Category does not belong to current user");
        }

        categoryRepository.delete(category);
    }

    @Override
    public GetAllCategoriesResult getAllCategories() {
        List<CategoryResult> categories = categoryRepository.findAll().stream()
                .map(c -> new CategoryResult(c.getId().value(), c.getName(), c.getColor(), c.getUserId().value(),
                        c.getCreatedAt(), c.getUpdatedAt()))
                .toList();

        return new GetAllCategoriesResult(categories);
    }

    @Override
    public GetUserCategoriesResult getUserCategories() {
        User user = userRepository.findById(currentUser.requireAuthenticated().id())
                .orElseThrow(() -> new UserException("User not found"));

        List<CategoryResult> categories = categoryRepository.findAllByUserId(user.getId()).stream()
                .map(c -> new CategoryResult(c.getId().value(), c.getName(), c.getColor(), c.getUserId().value(),
                        c.getCreatedAt(), c.getUpdatedAt()))
                .toList();

        return new GetUserCategoriesResult(categories);
    }
}
