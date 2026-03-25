package pl.ordovita.tasks.infrastructure.jpa.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TaskJpaRepository extends JpaRepository<TaskEntity, UUID> {

    @Query("FROM TaskEntity t WHERE t.userId.id = :userId")
    List<TaskEntity> findAllByUserId(@Param("userId") UUID userId);
}
