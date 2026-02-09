package pl.ordovita.identity.application.service;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.ordovita.identity.application.port.in.ChangePasswordUseCase;
import pl.ordovita.identity.application.port.in.DeviceManagerUseCase;
import pl.ordovita.identity.application.port.out.PasswordHasher;
import pl.ordovita.identity.domain.exception.UserException;
import pl.ordovita.identity.domain.model.user.*;
import pl.ordovita.identity.domain.port.CurrentUser;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.shared.domain.event.DomainEventPublisher;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChangePasswordServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordHasher passwordHasher;

    @Mock
    private DomainEventPublisher domainEventPublisher;

    @Mock
    private CurrentUser currentUser;

    @Mock
    private DeviceManagerUseCase deviceManagerUseCase;

    @Mock
    private HttpServletRequest httpServletRequest;

    @InjectMocks
    private ChangePasswordService changePasswordService;

    private User user;
    private UserId userId;

    @BeforeEach
    void setUp() {
        userId = UserId.generate();
        user = new User(
                userId,
                "John Doe",
                new Email("test@example.com"),
                Role.USER,
                new HashedPassword("hashedPassword"),
                Instant.now(),
                Instant.now(),
                Instant.now(),
                true,
                true,
                Instant.now()
        );

        when(deviceManagerUseCase.getClientIp(any())).thenReturn("192.168.1.1");
        when(deviceManagerUseCase.parseDeviceName(any())).thenReturn("Chrome on Windows");
    }

    @Test
    @DisplayName("Should change password successfully")
    void shouldChangePasswordSuccessfully() {
        ChangePasswordUseCase.ChangePasswordCommand command = new ChangePasswordUseCase.ChangePasswordCommand(
                "OldPassword123!",
                "NewPassword123!",
                "NewPassword123!"
        );

        when(currentUser.requireAuthenticated()).thenReturn(new pl.ordovita.identity.domain.port.AuthenticatedUser(userId, new Email("test@example.com"), Role.USER));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(passwordHasher.hash(any(RawPassword.class))).thenReturn(new HashedPassword("newHashedPassword"));

        ChangePasswordUseCase.ChangePasswordResult result = changePasswordService.change(command, httpServletRequest);

        assertNotNull(result);
        assertEquals(userId.value(), result.userId());
        verify(userRepository).save(user);
        verify(domainEventPublisher, atLeastOnce()).publish(any());
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void shouldThrowExceptionWhenUserNotFound() {
        ChangePasswordUseCase.ChangePasswordCommand command = new ChangePasswordUseCase.ChangePasswordCommand(
                "OldPassword123!",
                "NewPassword123!",
                "NewPassword123!"
        );

        when(currentUser.requireAuthenticated()).thenReturn(new pl.ordovita.identity.domain.port.AuthenticatedUser(userId, new Email("test@example.com"), Role.USER));
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(UserException.class, () -> changePasswordService.change(command, httpServletRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when passwords do not match")
    void shouldThrowExceptionWhenPasswordsDoNotMatch() {
        ChangePasswordUseCase.ChangePasswordCommand command = new ChangePasswordUseCase.ChangePasswordCommand(
                "OldPassword123!",
                "NewPassword123!",
                "DifferentPassword123!"
        );

        when(currentUser.requireAuthenticated()).thenReturn(new pl.ordovita.identity.domain.port.AuthenticatedUser(userId, new Email("test@example.com"), Role.USER));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThrows(UserException.class, () -> changePasswordService.change(command, httpServletRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when new password is same as old")
    void shouldThrowExceptionWhenNewPasswordIsSameAsOld() {
        ChangePasswordUseCase.ChangePasswordCommand command = new ChangePasswordUseCase.ChangePasswordCommand(
                "Password123!",
                "Password123!",
                "Password123!"
        );

        when(currentUser.requireAuthenticated()).thenReturn(new pl.ordovita.identity.domain.port.AuthenticatedUser(userId, new Email("test@example.com"), Role.USER));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThrows(UserException.class, () -> changePasswordService.change(command, httpServletRequest));
        verify(userRepository, never()).save(any(User.class));
    }
}
