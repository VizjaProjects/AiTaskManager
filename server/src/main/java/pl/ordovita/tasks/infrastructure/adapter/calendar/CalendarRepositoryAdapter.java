package pl.ordovita.tasks.infrastructure.adapter.calendar;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.tasks.domain.model.calendar.Calendar;
import pl.ordovita.tasks.domain.model.calendar.CalendarId;
import pl.ordovita.tasks.domain.port.CalendarRepository;
import pl.ordovita.tasks.infrastructure.jpa.calendar.CalendarEntity;
import pl.ordovita.tasks.infrastructure.jpa.calendar.CalendarJpaRepository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CalendarRepositoryAdapter implements CalendarRepository {

    private final CalendarJpaRepository calendarJpaRepository;

    @Override
    public Calendar save(Calendar calendar) {
        CalendarEntity entity = CalendarEntityMapper.from(calendar);
        return CalendarEntityMapper.toDomain(calendarJpaRepository.save(entity));
    }

    @Override
    public Optional<Calendar> findById(CalendarId id) {
        return calendarJpaRepository.findById(id.value()).map(CalendarEntityMapper::toDomain);
    }

    @Override
    public Optional<Calendar> findByUserId(UserId userId) {
        return calendarJpaRepository.findByUserId(userId.value()).map(CalendarEntityMapper::toDomain);
    }
}
