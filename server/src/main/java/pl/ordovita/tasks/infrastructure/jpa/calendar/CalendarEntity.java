package pl.ordovita.tasks.infrastructure.jpa.calendar;

import jakarta.persistence.*;
import lombok.*;
import pl.ordovita.identity.infrastructure.jpa.user.UserEntity;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "calendar_calendars")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CalendarEntity {

    @Id
    @Column(updatable = false, nullable = false, unique = true)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity userId;

    @Column(nullable = false)
    private boolean isPrimary;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;
}
