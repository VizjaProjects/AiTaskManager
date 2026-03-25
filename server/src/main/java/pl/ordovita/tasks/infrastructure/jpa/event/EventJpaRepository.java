package pl.ordovita.tasks.infrastructure.jpa.event;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface EventJpaRepository extends JpaRepository<EventEntity, UUID> {

    @Query("FROM EventEntity e WHERE e.calendarId.id = :calendarId")
    List<EventEntity> findAllByCalendarId(@Param("calendarId") UUID calendarId);
}
