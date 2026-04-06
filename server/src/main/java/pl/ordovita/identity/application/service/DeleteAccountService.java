package pl.ordovita.identity.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.domain.port.CurrentUser;
import pl.ordovita.identity.infrastructure.jpa.emailVerification.EmailVerificationJpaRepository;
import pl.ordovita.identity.infrastructure.jpa.passwordRestart.PasswordRestartJpaRepository;
import pl.ordovita.identity.infrastructure.jpa.user.UserJpaRepository;
import pl.ordovita.identity.infrastructure.jpa.userSesion.UserSessionJpaRepository;
import pl.ordovita.tasks.infrastructure.jpa.calendar.CalendarJpaRepository;
import pl.ordovita.tasks.infrastructure.jpa.category.TaskCategoryJpaRepository;
import pl.ordovita.tasks.infrastructure.jpa.event.EventJpaRepository;
import pl.ordovita.tasks.infrastructure.jpa.status.TaskStatusJpaRepository;
import pl.ordovita.tasks.infrastructure.jpa.task.TaskJpaRepository;
import pl.ordovita.surveys.infrastructure.jpa.userResponse.UserResponseJpaRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeleteAccountService {

    private final CurrentUser currentUser;
    private final UserJpaRepository userJpaRepository;
    private final UserSessionJpaRepository userSessionJpaRepository;
    private final EmailVerificationJpaRepository emailVerificationJpaRepository;
    private final PasswordRestartJpaRepository passwordRestartJpaRepository;
    private final EventJpaRepository eventJpaRepository;
    private final TaskJpaRepository taskJpaRepository;
    private final CalendarJpaRepository calendarJpaRepository;
    private final TaskCategoryJpaRepository taskCategoryJpaRepository;
    private final TaskStatusJpaRepository taskStatusJpaRepository;
    private final UserResponseJpaRepository userResponseJpaRepository;

    @Transactional
    public void deleteAccount() {
        UserId userId = currentUser.requireAuthenticated().id();
        UUID uid = userId.value();

        log.info("Deleting account for user {}", uid);
 
        calendarJpaRepository.findByUserId(uid).ifPresent(calendar ->
                eventJpaRepository.deleteAll(eventJpaRepository.findAllByCalendarId(calendar.getId()))
        );

        taskJpaRepository.deleteAll(taskJpaRepository.findAllByUserId(uid));

        calendarJpaRepository.findByUserId(uid).ifPresent(calendarJpaRepository::delete);

        taskCategoryJpaRepository.deleteAll(taskCategoryJpaRepository.findAllByUserId(uid));

        taskStatusJpaRepository.deleteAll(taskStatusJpaRepository.findAllByUserId(uid));

        userResponseJpaRepository.deleteAll(userResponseJpaRepository.findAllByUserId(uid));

        userSessionJpaRepository.deleteAll(userSessionJpaRepository.findAllByUserId(uid));

        emailVerificationJpaRepository.findActiveByUserId(uid).ifPresent(emailVerificationJpaRepository::delete);

        passwordRestartJpaRepository.findByUserId(uid).ifPresent(passwordRestartJpaRepository::delete);

        userJpaRepository.deleteById(uid);

        log.info("Account deleted for user {}", uid);
    }
}
