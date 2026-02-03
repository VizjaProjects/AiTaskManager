package pl.ordovita.identity.domain.model.user;

import pl.ordovita.identity.domain.exception.PasswordException;

public record RawPassword(String value) {

    public RawPassword {
        validate(value);
    }

    private static void validate(String value) {
        if (value == null || value.isEmpty()) {
            throw new PasswordException("Password cannot be null or empty");
        }
        if (value.length() < 8) {
            throw new PasswordException("Password must be at least 8 characters long");
        }
        if (!value.matches(".*[A-Z].*")) {
            throw new PasswordException("Password must contain at least one uppercase letter.");
        }
        if (!value.matches(".*[a-z].*")) {
            throw new PasswordException("Password must contain at least one lowercase letter.");
        }
        if (!value.matches(".*[0-9].*")) {
            throw new PasswordException("Password must contain at least one digit.");
        }
        if (!value.matches(".*[\\W_].*")) {
            throw new PasswordException("Password must contain at least one special character.");
        }
    }


    public static String toString(RawPassword rawPassword) {
        return rawPassword.toString();
    }

}
