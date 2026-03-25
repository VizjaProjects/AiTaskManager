package pl.ordovita.tasks.domain.port;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.tasks.domain.model.calendar.Calendar;
import pl.ordovita.tasks.domain.model.calendar.CalendarId;

import java.util.Optional;

public interface CalendarRepository {
    Calendar save(Calendar calendar);
    Optional<Calendar> findById(CalendarId id);
    Optional<Calendar> findByUserId(UserId userId);
}
