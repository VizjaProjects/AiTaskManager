package pl.ordovita.identity.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.ordovita.identity.application.port.in.ChangeFullNameUseCase;
import pl.ordovita.identity.domain.exception.UserException;
import pl.ordovita.identity.domain.model.user.*;
import pl.ordovita.identity.domain.port.CurrentUser;
import pl.ordovita.identity.domain.port.UserRepository;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChangeFullNameServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CurrentUser currentUser;

    @InjectMocks
    private ChangeFullNameService changeFullNameService;

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
    }

    @Test
    @DisplayName("Should change full name successfully")
    void shouldChangeFullNameSuccessfully() {
        ChangeFullNameUseCase.ChangeFullNameCommand command = new ChangeFullNameUseCase.ChangeFullNameCommand("Jane Doe");

        when(currentUser.requireAuthenticated()).thenReturn(new pl.ordovita.identity.domain.port.AuthenticatedUser(userId, new Email("test@example.com"), Role.USER));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        ChangeFullNameUseCase.ChangeFullNameResult result = changeFullNameService.changeFullName(command);

        assertNotNull(result);
        assertEquals("Jane Doe", result.newFullName());
        assertEquals(userId.value(), result.userId());
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void shouldThrowExceptionWhenUserNotFound() {
        ChangeFullNameUseCase.ChangeFullNameCommand command = new ChangeFullNameUseCase.ChangeFullNameCommand("Jane Doe");

        when(currentUser.requireAuthenticated()).thenReturn(new pl.ordovita.identity.domain.port.AuthenticatedUser(userId, new Email("test@example.com"), Role.USER));
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(UserException.class, () -> changeFullNameService.changeFullName(command));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when user is deactivated")
    void shouldThrowExceptionWhenUserIsDeactivated() {
        User disabledUser = new User(
                userId,
                "John Doe",
                new Email("test@example.com"),
                Role.USER,
                new HashedPassword("hashedPassword"),
                Instant.now(),
                Instant.now(),
                Instant.now(),
                false,
                true,
                Instant.now()
        );

        ChangeFullNameUseCase.ChangeFullNameCommand command = new ChangeFullNameUseCase.ChangeFullNameCommand("Jane Doe");

        when(currentUser.requireAuthenticated()).thenReturn(new pl.ordovita.identity.domain.port.AuthenticatedUser(userId, new Email("test@example.com"), Role.USER));
        when(userRepository.findById(userId)).thenReturn(Optional.of(disabledUser));

        assertThrows(UserException.class, () -> changeFullNameService.changeFullName(command));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when new name is same as old")
    void shouldThrowExceptionWhenNewNameIsSameAsOld() {
        ChangeFullNameUseCase.ChangeFullNameCommand command = new ChangeFullNameUseCase.ChangeFullNameCommand("John Doe");

        when(currentUser.requireAuthenticated()).thenReturn(new pl.ordovita.identity.domain.port.AuthenticatedUser(userId, new Email("test@example.com"), Role.USER));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThrows(UserException.class, () -> changeFullNameService.changeFullName(command));
        verify(userRepository, never()).save(any(User.class));
    }
}
