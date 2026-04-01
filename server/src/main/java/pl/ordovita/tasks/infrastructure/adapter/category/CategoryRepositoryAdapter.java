package pl.ordovita.tasks.infrastructure.adapter.category;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.tasks.domain.model.category.CategoryId;
import pl.ordovita.tasks.domain.model.category.TaskCategory;
import pl.ordovita.tasks.domain.port.CategoryRepository;
import pl.ordovita.tasks.infrastructure.jpa.category.TaskCategoryEntity;
import pl.ordovita.tasks.infrastructure.jpa.category.TaskCategoryJpaRepository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CategoryRepositoryAdapter implements CategoryRepository {

    private final TaskCategoryJpaRepository categoryJpaRepository;

    @Override
    public TaskCategory save(TaskCategory category) {
        TaskCategoryEntity entity = TaskCategoryEntityMapper.from(category);
        return TaskCategoryEntityMapper.toDomain(categoryJpaRepository.save(entity));
    }

    @Override
    public Optional<TaskCategory> findById(CategoryId id) {
        return categoryJpaRepository.findById(id.value()).map(TaskCategoryEntityMapper::toDomain);
    }

    @Override
    public List<TaskCategory> findAllByUserId(UserId userId) {
        return categoryJpaRepository.findAllByUserId(userId.value()).stream().map(TaskCategoryEntityMapper::toDomain).toList();
    }

    @Override
    public List<TaskCategory> findAll() {
        return categoryJpaRepository.findAll().stream().map(TaskCategoryEntityMapper::toDomain).toList();
    }

    @Override
    public void delete(TaskCategory category) {
        categoryJpaRepository.delete(TaskCategoryEntityMapper.from(category));
    }

    @Override
    public int count(UserId userId) {
        return categoryJpaRepository.findCategoryCount(userId.value());
    }
}
