package pl.ordovita.identity.infrastructure.adapter.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.identity.domain.model.user.Role;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.domain.port.AuthenticatedUser;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SpringSecurityCurrentUserTest {

    private SpringSecurityCurrentUser currentUser;
    private SecurityContext securityContext;

    @BeforeEach
    void setUp() {
        currentUser = new SpringSecurityCurrentUser();
        securityContext = mock(SecurityContext.class);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @DisplayName("Should return authenticated user when authentication is valid")
    void shouldReturnAuthenticatedUserWhenAuthenticationIsValid() {
        UserId userId = UserId.generate();
        AuthenticatedUser authenticatedUser = new AuthenticatedUser(userId, new Email("test@example.com"), Role.USER);
        IdentityPrincipal principal = new IdentityPrincipal(authenticatedUser);

        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null, null);
        when(securityContext.getAuthentication()).thenReturn(authentication);

        Optional<AuthenticatedUser> result = currentUser.get();

        assertTrue(result.isPresent());
        assertEquals(userId, result.get().id());
        assertEquals(Role.USER, result.get().role());
    }

    @Test
    @DisplayName("Should return empty when authentication is null")
    void shouldReturnEmptyWhenAuthenticationIsNull() {
        when(securityContext.getAuthentication()).thenReturn(null);

        Optional<AuthenticatedUser> result = currentUser.get();

        assertFalse(result.isPresent());
    }

    @Test
    @DisplayName("Should return empty when authentication is not authenticated")
    void shouldReturnEmptyWhenAuthenticationIsNotAuthenticated() {
        Authentication authentication = mock(Authentication.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(false);

        Optional<AuthenticatedUser> result = currentUser.get();

        assertFalse(result.isPresent());
    }

    @Test
    @DisplayName("Should return empty when principal is not IdentityPrincipal")
    void shouldReturnEmptyWhenPrincipalIsNotIdentityPrincipal() {
        Authentication authentication = new UsernamePasswordAuthenticationToken("user", "password");
        when(securityContext.getAuthentication()).thenReturn(authentication);

        Optional<AuthenticatedUser> result = currentUser.get();

        assertFalse(result.isPresent());
    }
}
