package pl.ordovita.identity.domain.port;

import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.identity.domain.model.user.Role;
import pl.ordovita.identity.domain.model.user.UserId;

public record AuthenticatedUser(UserId id, Email email, Role role) {
}
