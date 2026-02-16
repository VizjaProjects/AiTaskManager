package pl.ordovita.surveys.domain.model.userResponse;

import pl.ordovita.surveys.domain.exception.TextAnswerException;

public record TextAnswer(String value) {

    public TextAnswer{
        validate(value);
    }


    private void validate(String value) {

        if(value == null || value.isEmpty()) throw new TextAnswerException("Value cannot be null or empty");
        if(value.length() < 3) throw new TextAnswerException("Value must be at least 3 characters");
        if (value.length() > 100) throw new TextAnswerException("Value must be at most 100 characters");
    }
}
