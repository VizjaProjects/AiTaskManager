package pl.ordovita.identity.application.port.out;

import pl.ordovita.identity.domain.model.user.HashedPassword;
import pl.ordovita.identity.domain.model.user.RawPassword;

public interface PasswordHasher {
    HashedPassword hash(RawPassword raw);

    boolean matches(RawPassword rawPassword, HashedPassword hashedPassword);
}
