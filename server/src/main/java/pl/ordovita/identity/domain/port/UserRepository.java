package pl.ordovita.identity.domain.port;

import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.model.user.UserId;

import java.util.Optional;

public interface UserRepository {
    User save(User user);

    Optional<User> findByEmail(Email email);

    Optional<User> findByFullName(String fullName);

    Optional<User> findById(UserId userId);

    boolean existsByEmail(Email email);

}
