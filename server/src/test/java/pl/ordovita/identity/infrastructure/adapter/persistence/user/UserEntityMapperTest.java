package pl.ordovita.identity.infrastructure.adapter.persistence.user;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import pl.ordovita.identity.domain.model.user.*;
import pl.ordovita.identity.infrastructure.jpa.user.UserEntity;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class UserEntityMapperTest {

    @Test
    @DisplayName("Should map User to UserEntity")
    void shouldMapUserToUserEntity() {
        UserId userId = new UserId(UUID.randomUUID());
        Email email = new Email("test@example.com");
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");
        Instant now = Instant.now();

        User user = new User(
                userId,
                "John Doe",
                email,
                Role.USER,
                hashedPassword,
                now,
                now,
                now,
                true,
                true,
                now
        );

        UserEntity entity = UserEntityMapper.from(user);

        assertNotNull(entity);
        assertEquals(userId.value(), entity.getId());
        assertEquals("John Doe", entity.getFullName());
        assertEquals("test@example.com", entity.getEmail());
        assertEquals(Role.USER, entity.getRole());
        assertEquals("hashedPassword", entity.getPassword());
        assertEquals(now, entity.getCreatedAt());
        assertEquals(now, entity.getUpdatedAt());
        assertEquals(now, entity.getLastLoginAt());
        assertTrue(entity.isEnabled());
        assertTrue(entity.isEmailVerified());
        assertEquals(now, entity.getEmailVerifiedAt());
    }

    @Test
    @DisplayName("Should map UserEntity to User")
    void shouldMapUserEntityToUser() {
        UUID id = UUID.randomUUID();
        Instant now = Instant.now();

        UserEntity entity = new UserEntity(
                id,
                "Jane Doe",
                "jane@example.com",
                Role.ADMIN,
                "hashedPassword",
                now,
                now,
                now,
                true,
                true,
                now
        );

        User user = UserEntityMapper.toDomain(entity);

        assertNotNull(user);
        assertEquals(id, user.getId().value());
        assertEquals("Jane Doe", user.getFullName());
        assertEquals("jane@example.com", user.getEmail().value());
        assertEquals(Role.ADMIN, user.getRole());
        assertEquals("hashedPassword", user.getHashedPassword().value());
        assertEquals(now, user.getCreatedAt());
        assertEquals(now, user.getUpdatedAt());
        assertEquals(now, user.getLastLoginAt());
        assertTrue(user.isEnabled());
        assertTrue(user.isEmailVerified());
        assertEquals(now, user.getEmailVerifiedAt());
    }

    @Test
    @DisplayName("Should map User with null optional fields to UserEntity")
    void shouldMapUserWithNullOptionalFieldsToUserEntity() {
        UserId userId = new UserId(UUID.randomUUID());
        Email email = new Email("test@example.com");
        HashedPassword hashedPassword = new HashedPassword("hashedPassword");
        Instant now = Instant.now();

        User user = new User(
                userId,
                "John Doe",
                email,
                Role.USER,
                hashedPassword,
                now,
                null,
                null,
                false,
                false,
                null
        );

        UserEntity entity = UserEntityMapper.from(user);

        assertNotNull(entity);
        assertNull(entity.getUpdatedAt());
        assertNull(entity.getLastLoginAt());
        assertFalse(entity.isEnabled());
        assertFalse(entity.isEmailVerified());
        assertNull(entity.getEmailVerifiedAt());
    }

    @Test
    @DisplayName("Should map UserEntity with null optional fields to User")
    void shouldMapUserEntityWithNullOptionalFieldsToUser() {
        UUID id = UUID.randomUUID();
        Instant now = Instant.now();

        UserEntity entity = new UserEntity(
                id,
                "Jane Doe",
                "jane@example.com",
                Role.USER,
                "hashedPassword",
                now,
                null,
                null,
                false,
                false,
                null
        );

        User user = UserEntityMapper.toDomain(entity);

        assertNotNull(user);
        assertNull(user.getUpdatedAt());
        assertNull(user.getLastLoginAt());
        assertFalse(user.isEnabled());
        assertFalse(user.isEmailVerified());
        assertNull(user.getEmailVerifiedAt());
    }
}
