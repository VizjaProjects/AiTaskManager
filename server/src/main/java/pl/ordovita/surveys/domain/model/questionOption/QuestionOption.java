package pl.ordovita.surveys.domain.model.questionOption;

import pl.ordovita.surveys.domain.exception.QuestionOptionException;
import pl.ordovita.surveys.domain.model.questions.QuestionId;

import java.time.Instant;

public class QuestionOption {

    private final QuestionOptionId id;
    private final OptionText optionText;
    private final Instant createAt;
    private final Instant updateAt;

    public QuestionOption(QuestionOptionId id, OptionText optionText, Instant createAt, Instant updateAt) {
        if(id == null) throw new QuestionOptionException("Question option id cannot be null");
        if(optionText == null) throw new QuestionOptionException("Option text cannot be null");
        if(createAt == null) throw new QuestionOptionException("Created at cannot be null");
        if(updateAt == null) throw new QuestionOptionException("Updated at cannot be null");
        this.id = id;
        this.optionText = optionText;
        this.createAt = createAt;
        this.updateAt = updateAt;
    }

    public static QuestionOption create(QuestionId questionId, OptionText optionText) {
        return new QuestionOption(QuestionOptionId.generate(), optionText, Instant.now(), Instant.now());
    }


    public QuestionOptionId getId() {
        return id;
    }

    public OptionText getOptionText() {
        return optionText;
    }

    public Instant getCreateAt() {
        return createAt;
    }

    public Instant getUpdateAt() {
        return updateAt;
    }
}
