package pl.ordovita.tasks.domain.model.calendar;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.tasks.domain.exception.CalendarException;

import java.time.Instant;

public class Calendar {

    private final CalendarId id;
    private final UserId userId;
    private boolean isPrimary;
    private final Instant createdAt;
    private Instant updatedAt;

    public Calendar(CalendarId id, UserId userId, boolean isPrimary, Instant createdAt, Instant updatedAt) {
        if (id == null) throw new CalendarException("Calendar id cannot be null");
        if (userId == null) throw new CalendarException("UserId cannot be null");
        if (createdAt == null) throw new CalendarException("CreatedAt cannot be null");
        if (updatedAt == null) throw new CalendarException("UpdatedAt cannot be null");
        this.id = id;
        this.userId = userId;
        this.isPrimary = isPrimary;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Calendar create(UserId userId, boolean isPrimary) {
        return new Calendar(CalendarId.generate(), userId, isPrimary, Instant.now(), Instant.now());
    }

    public CalendarId getId() {
        return id;
    }

    public UserId getUserId() {
        return userId;
    }

    public boolean isPrimary() {
        return isPrimary;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
