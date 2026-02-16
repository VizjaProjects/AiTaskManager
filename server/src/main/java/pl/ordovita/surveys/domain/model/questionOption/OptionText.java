package pl.ordovita.surveys.domain.model.questionOption;

import pl.ordovita.surveys.domain.exception.OptionTextException;
import pl.ordovita.surveys.domain.exception.TextAnswerException;

public record OptionText(String value) {

    public OptionText{
        validate(value);
    }


    private void validate(String value) {

        if(value == null || value.isEmpty()) throw new OptionTextException("Value cannot be null or empty");
        if(value.length() < 3) throw new OptionTextException("Value must be at least 3 characters");
        if (value.length() > 100) throw new OptionTextException("Value must be at most 100 characters");
    }
}
