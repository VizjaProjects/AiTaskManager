package pl.ordovita.tasks.presentation.rest;

import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.ordovita.tasks.application.port.in.CreateCategoryUseCase;
import pl.ordovita.tasks.application.port.in.DeleteCategoryUseCase;
import pl.ordovita.tasks.application.port.in.EditCategoryUseCase;
import pl.ordovita.tasks.application.port.in.GetCategoriesUseCase;
import pl.ordovita.tasks.presentation.dto.CreateCategoryRequest;
import pl.ordovita.tasks.presentation.dto.EditCategoryRequest;

import java.util.UUID;

@RestController
@RequestMapping("/v1/api/category")
@RequiredArgsConstructor
public class CategoryController {

    private final CreateCategoryUseCase createCategoryUseCase;
    private final EditCategoryUseCase editCategoryUseCase;
    private final DeleteCategoryUseCase deleteCategoryUseCase;
    private final GetCategoriesUseCase getCategoriesUseCase;

    @PostMapping
    public ResponseEntity<CreateCategoryUseCase.CreateCategoryResult> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        CreateCategoryUseCase.CreateCategoryCommand command = new CreateCategoryUseCase.CreateCategoryCommand(request.name(), request.color());
        CreateCategoryUseCase.CreateCategoryResult result = createCategoryUseCase.createCategory(command);

        return ResponseEntity.status(201).body(result);
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<EditCategoryUseCase.EditCategoryResult> editCategory(@NonNull @PathVariable UUID categoryId,
                                                                                @Valid @RequestBody EditCategoryRequest request) {
        EditCategoryUseCase.EditCategoryCommand command = new EditCategoryUseCase.EditCategoryCommand(categoryId, request.name(), request.color());
        EditCategoryUseCase.EditCategoryResult result = editCategoryUseCase.editCategory(command);

        return ResponseEntity.ok().body(result);
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@NonNull @PathVariable UUID categoryId) {
        DeleteCategoryUseCase.DeleteCategoryCommand command = new DeleteCategoryUseCase.DeleteCategoryCommand(categoryId);
        deleteCategoryUseCase.deleteCategory(command);

        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<GetCategoriesUseCase.GetAllCategoriesResult> getAllCategories() {
        return ResponseEntity.ok().body(getCategoriesUseCase.getAllCategories());
    }

    @GetMapping("/my")
    public ResponseEntity<GetCategoriesUseCase.GetUserCategoriesResult> getUserCategories() {
        return ResponseEntity.ok().body(getCategoriesUseCase.getUserCategories());
    }
}
