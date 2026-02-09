package pl.ordovita.identity.application.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.ordovita.identity.application.exception.RegisterException;
import pl.ordovita.identity.application.port.in.RegisterUserUseCase;
import pl.ordovita.identity.application.port.out.PasswordHasher;
import pl.ordovita.identity.domain.model.user.*;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.shared.domain.event.DomainEventPublisher;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegisterUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordHasher passwordHasher;

    @Mock
    private DomainEventPublisher domainEventPublisher;

    @InjectMocks
    private RegisterUserService registerUserService;

    @BeforeEach
    void setUp() {
        when(passwordHasher.hash(any(RawPassword.class))).thenReturn(new HashedPassword("hashedPassword"));
    }

    @Test
    @DisplayName("Should register user successfully")
    void shouldRegisterUserSuccessfully() {
        RegisterUserUseCase.RegisterUserCommand command = new RegisterUserUseCase.RegisterUserCommand(
                "John Doe",
                "test@example.com",
                "Password123!",
                passwordHasher
        );

        when(userRepository.findByEmail(any(Email.class))).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RegisterUserUseCase.RegisterUserResult result = registerUserService.register(command);

        assertNotNull(result);
        assertEquals("test@example.com", result.email());
        verify(userRepository).save(any(User.class));
        verify(domainEventPublisher, atLeastOnce()).publish(any());
    }

    @Test
    @DisplayName("Should throw exception when email already exists")
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        RegisterUserUseCase.RegisterUserCommand command = new RegisterUserUseCase.RegisterUserCommand(
                "John Doe",
                "test@example.com",
                "Password123!",
                passwordHasher
        );

        User existingUser = new User(
                UserId.generate(),
                "Existing User",
                new Email("test@example.com"),
                Role.USER,
                new HashedPassword("hashedPassword"),
                java.time.Instant.now(),
                null,
                null,
                true,
                false,
                null
        );

        when(userRepository.findByEmail(any(Email.class))).thenReturn(Optional.of(existingUser));

        assertThrows(RegisterException.class, () -> registerUserService.register(command));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should create user with correct attributes")
    void shouldCreateUserWithCorrectAttributes() {
        RegisterUserUseCase.RegisterUserCommand command = new RegisterUserUseCase.RegisterUserCommand(
                "John Doe",
                "test@example.com",
                "Password123!",
                passwordHasher
        );

        when(userRepository.findByEmail(any(Email.class))).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        registerUserService.register(command);

        verify(userRepository).save(argThat(user ->
                user.getFullName().equals("John Doe") &&
                        user.getEmail().value().equals("test@example.com") &&
                        user.getRole() == Role.USER &&
                        !user.isEnabled() &&
                        !user.isEmailVerified()
        ));
    }
}
