package pl.ordovita.tasks.infrastructure.jpa.calendar;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface CalendarJpaRepository extends JpaRepository<CalendarEntity, UUID> {

    @Query("FROM CalendarEntity c WHERE c.userId.id = :userId")
    Optional<CalendarEntity> findByUserId(@Param("userId") UUID userId);
}
