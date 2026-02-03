package pl.ordovita.identity.domain.model.user;

import pl.ordovita.identity.application.port.out.PasswordHasher;

public record HashedPassword(String value) {

    public boolean matchesRaw(RawPassword raw, PasswordHasher hasher) {
        return hasher.matches(raw, this);
    }
}
