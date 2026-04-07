package pl.ordovita.tasks.infrastructure.jpa.aiStatistic;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AiStatisticJpaRepository extends JpaRepository<AiStatisticEntity, UUID> {
    @Query("FROM AiStatisticEntity a WHERE a.userId.id = :userId")
    List<AiStatisticEntity> findAllByUserId(@Param("userId") UUID userId);
}
