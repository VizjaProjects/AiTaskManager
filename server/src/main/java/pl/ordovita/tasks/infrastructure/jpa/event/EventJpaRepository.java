package pl.ordovita.tasks.infrastructure.jpa.event;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import pl.ordovita.tasks.domain.model.event.Event;
import pl.ordovita.tasks.domain.model.event.EventStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventJpaRepository extends JpaRepository<EventEntity, UUID> {

    @Query("FROM EventEntity e WHERE e.calendarId.id = :calendarId")
    List<EventEntity> findAllByCalendarId(@Param("calendarId") UUID calendarId);

    @Query("FROM EventEntity e WHERE e.calendarId.id = :calendarId AND e.status = :status")
    List<EventEntity> findByCalendarIdAndStatus(@Param("calendarId") UUID calendarId,
                                                 @Param("status") EventStatus status);

    @Query("FROM EventEntity e WHERE e.taskId.id = :taskId")
    List<EventEntity> findByTaskId(@Param("taskId") UUID taskId);

    @Query("FROM EventEntity e WHERE e.taskId.id = :taskId")
    Optional<EventEntity> findEventByTaskId(@Param("taskId") UUID taskId);
}
