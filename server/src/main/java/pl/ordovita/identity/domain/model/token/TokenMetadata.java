package pl.ordovita.identity.domain.model.token;

import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.identity.domain.model.user.Role;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.domain.model.userSession.UserSessionId;

public record TokenMetadata(
        UserId userId,
        Email email,
        Role role,
        UserSessionId sessionId
) {
    public TokenMetadata {
        if (userId == null) {
            throw new IllegalArgumentException("User id cannot be null");
        }
        if (email == null) {
            throw new IllegalArgumentException("Email cannot be null");
        }
        if (role == null) {
            throw new IllegalArgumentException("Role cannot be null");
        }
        if (sessionId == null) {
            throw new IllegalArgumentException("Session id cannot be null");
        }
    }
}
