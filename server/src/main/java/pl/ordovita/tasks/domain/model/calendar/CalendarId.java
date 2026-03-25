package pl.ordovita.tasks.domain.model.calendar;

import java.util.UUID;

public record CalendarId(UUID value) {

    public static CalendarId generate() {
        return new CalendarId(UUID.randomUUID());
    }
}
