package pl.ordovita.shared.application.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import pl.ordovita.identity.domain.event.UserRegisteredEvent;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.tasks.domain.model.calendar.Calendar;
import pl.ordovita.tasks.domain.model.status.TaskStatus;
import pl.ordovita.tasks.domain.port.CalendarRepository;
import pl.ordovita.tasks.domain.port.TaskStatusRepository;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserCalendarListener {

    private final CalendarRepository calendarRepository;
    private final TaskStatusRepository taskStatusRepository;

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void handle(UserRegisteredEvent event) {
        UserId userId = new UserId(event.userId());

        log.info("Creating primary calendar for user {}", event.userId());
        Calendar calendar = Calendar.create(userId, true);
        calendarRepository.save(calendar);

        log.info("Creating default task statuses for user {}", event.userId());
        taskStatusRepository.save(TaskStatus.create("To Do", "#3B82F6", userId));
        taskStatusRepository.save(TaskStatus.create("In Progress", "#F59E0B", userId));
        taskStatusRepository.save(TaskStatus.create("Completed", "#10B981", userId));
        taskStatusRepository.save(TaskStatus.create("Cancelled", "#EF4444", userId));
    }
}
