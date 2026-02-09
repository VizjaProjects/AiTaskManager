package pl.ordovita.identity.domain.model.user;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class UserIdTest {

    @Test
    @DisplayName("Should generate unique user id")
    void shouldGenerateUniqueUserId() {
        UserId userId1 = UserId.generate();
        UserId userId2 = UserId.generate();

        assertNotNull(userId1);
        assertNotNull(userId2);
        assertNotEquals(userId1.value(), userId2.value());
    }

    @Test
    @DisplayName("Should create user id from UUID")
    void shouldCreateUserIdFromUUID() {
        UUID uuid = UUID.randomUUID();
        UserId userId = new UserId(uuid);

        assertEquals(uuid, userId.value());
    }

    @Test
    @DisplayName("Should compare user ids correctly")
    void shouldCompareUserIdsCorrectly() {
        UUID uuid = UUID.randomUUID();
        UserId userId1 = new UserId(uuid);
        UserId userId2 = new UserId(uuid);

        assertEquals(userId1, userId2);
    }
}
