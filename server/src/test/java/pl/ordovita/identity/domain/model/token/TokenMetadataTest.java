package pl.ordovita.identity.domain.model.token;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.identity.domain.model.user.Role;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.domain.model.userSession.UserSessionId;

import static org.junit.jupiter.api.Assertions.*;

class TokenMetadataTest {

    @Test
    @DisplayName("Should create token metadata with all fields")
    void shouldCreateTokenMetadataWithAllFields() {
        UserId userId = UserId.generate();
        Email email = new Email("test@example.com");
        Role role = Role.USER;
        UserSessionId sessionId = UserSessionId.generate();

        TokenMetadata metadata = new TokenMetadata(userId, email, role, sessionId);

        assertNotNull(metadata);
        assertEquals(userId, metadata.userId());
        assertEquals(email, metadata.email());
        assertEquals(role, metadata.role());
        assertEquals(sessionId, metadata.sessionId());
    }

    @Test
    @DisplayName("Should create token metadata for admin user")
    void shouldCreateTokenMetadataForAdminUser() {
        UserId userId = UserId.generate();
        Email email = new Email("admin@example.com");
        Role role = Role.ADMIN;
        UserSessionId sessionId = UserSessionId.generate();

        TokenMetadata metadata = new TokenMetadata(userId, email, role, sessionId);

        assertEquals(Role.ADMIN, metadata.role());
    }
}
