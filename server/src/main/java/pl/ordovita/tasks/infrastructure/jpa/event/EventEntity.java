package pl.ordovita.tasks.infrastructure.jpa.event;

import jakarta.persistence.*;
import lombok.*;
import pl.ordovita.tasks.domain.model.event.EventStatus;
import pl.ordovita.tasks.domain.model.event.ProposedBy;
import pl.ordovita.tasks.infrastructure.jpa.calendar.CalendarEntity;
import pl.ordovita.tasks.infrastructure.jpa.task.TaskEntity;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "calendar_events")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EventEntity {

    @Id
    @Column(updatable = false, nullable = false, unique = true)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private TaskEntity taskId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private Instant startDateTime;

    @Column(nullable = false)
    private Instant endDateTime;

    @Column(nullable = false)
    private boolean allDay;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProposedBy proposedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "calendar_id", nullable = false)
    private CalendarEntity calendarId;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;
}
