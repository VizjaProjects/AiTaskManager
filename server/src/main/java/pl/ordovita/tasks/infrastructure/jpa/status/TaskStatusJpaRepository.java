package pl.ordovita.tasks.infrastructure.jpa.status;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TaskStatusJpaRepository extends JpaRepository<TaskStatusEntity, UUID> {

    @Query("FROM TaskStatusEntity s WHERE s.userId.id = :userId")
    List<TaskStatusEntity> findAllByUserId(@Param("userId") UUID userId);
}
