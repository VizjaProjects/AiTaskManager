package pl.ordovita.tasks.infrastructure.jpa.category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TaskCategoryJpaRepository extends JpaRepository<TaskCategoryEntity, UUID> {

    @Query("FROM TaskCategoryEntity c WHERE c.userId.id = :userId")
    List<TaskCategoryEntity> findAllByUserId(@Param("userId") UUID userId);

    //TODO: Zmienic limity na w zaleznosci od planu (user limit)
    @Query("SELECT COUNT(c) FROM TaskCategoryEntity c WHERE c.userId = :userId")
    int findCategoryCount(@Param("userId") UUID userId);
}
