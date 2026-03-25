package pl.ordovita.tasks.infrastructure.adapter.calendar;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.infrastructure.jpa.user.UserEntity;
import pl.ordovita.tasks.domain.model.calendar.Calendar;
import pl.ordovita.tasks.domain.model.calendar.CalendarId;
import pl.ordovita.tasks.infrastructure.jpa.calendar.CalendarEntity;

public class CalendarEntityMapper {

    public static CalendarEntity from(Calendar calendar) {
        UserEntity userEntity = new UserEntity();
        userEntity.setId(calendar.getUserId().value());

        return new CalendarEntity(
                calendar.getId().value(),
                userEntity,
                calendar.isPrimary(),
                calendar.getCreatedAt(),
                calendar.getUpdatedAt()
        );
    }

    public static Calendar toDomain(CalendarEntity entity) {
        return new Calendar(
                new CalendarId(entity.getId()),
                new UserId(entity.getUserId().getId()),
                entity.isPrimary(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
