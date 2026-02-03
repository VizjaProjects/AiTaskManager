package pl.ordovita.identity.domain.model.user;

import pl.ordovita.identity.domain.exception.EmailException;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public record Email(String value) {

    public Email {
        validate(value);
    }

    private void validate(String value) {
        if (value == null || value.isBlank()) {
            throw new EmailException("Email cannot be null or blank");
        }

        Pattern pattern = Pattern.compile("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");
        Matcher matcher = pattern.matcher(value);
        if (!matcher.matches()) {
            throw new EmailException("Invalid email address");
        }
    }
}
