package pl.ordovita.identity.domain.model.token;

import pl.ordovita.identity.domain.exception.TokenException;

public class AccessToken {

    private final String value;

    private AccessToken(String value) {
        if (value == null || value.isBlank()) {
            throw new TokenException("Access token cannot be null or blank");
        }
        this.value = value;
    }

    public static AccessToken of(String value) {
        return new AccessToken(value);
    }

    public String value() {
        return value;
    }

    @Override
    public String toString() {
        return "AccessToken{REDACTED}";
    }
}
