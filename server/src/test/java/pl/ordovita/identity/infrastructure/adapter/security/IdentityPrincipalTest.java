package pl.ordovita.identity.infrastructure.adapter.security;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.identity.domain.model.user.Role;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.domain.port.AuthenticatedUser;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class IdentityPrincipalTest {

    @Test
    @DisplayName("Should create identity principal")
    void shouldCreateIdentityPrincipal() {
        UserId userId = new UserId(UUID.randomUUID());
        AuthenticatedUser authenticatedUser = new AuthenticatedUser(userId, new Email("test@example.com"), Role.USER);

        IdentityPrincipal principal = new IdentityPrincipal(authenticatedUser);

        assertNotNull(principal);
        assertEquals(authenticatedUser, principal.getAuthenticatedUser());
    }

    @Test
    @DisplayName("Should return user id as name")
    void shouldReturnUserIdAsName() {
        UserId userId = new UserId(UUID.randomUUID());
        AuthenticatedUser authenticatedUser = new AuthenticatedUser(userId, new Email("test@example.com"), Role.USER);

        IdentityPrincipal principal = new IdentityPrincipal(authenticatedUser);

        assertEquals(userId.value().toString(), principal.getName());
    }
}
