package pl.ordovita.surveys.domain.model.questions;

import pl.ordovita.surveys.domain.exception.QuestionException;
import pl.ordovita.surveys.domain.model.questionOption.QuestionOption;
import pl.ordovita.surveys.domain.model.questionOption.QuestionOptionId;
import pl.ordovita.surveys.domain.model.surveys.Survey;
import pl.ordovita.surveys.domain.model.surveys.SurveyId;

import java.time.Instant;
import java.util.Set;

public class Question {
    private final QuestionId id;
    private SurveyId surveyId;
    private Set<QuestionOption> questionOptions;
    private final String questionText;
    private final QuestionType questionType;
    private final boolean isRequired;
    private final Instant createdAt;
    private final Instant updatedAt;

    public Question(QuestionId id, SurveyId surveyId, Set<QuestionOption> questionOptions, String questionText, QuestionType questionType,  boolean isRequired, Instant createdAt, Instant updatedAt) {
        if(id == null) throw new QuestionException("id cannot be null");
        if(surveyId == null) throw new QuestionException("surveyId cannot be null");
        if(questionText == null) throw new QuestionException("questionText cannot be null");
        if(questionType == null) throw new QuestionException("questionType cannot be null");
        if(createdAt == null) throw new QuestionException("createdAt cannot be null");
        if(updatedAt == null) throw new QuestionException("updatedAt cannot be null");
        this.id = id;
        this.surveyId = surveyId;
        this.questionOptions = questionOptions;
        this.questionText = questionText;
        this.questionType = questionType;
        this.isRequired = isRequired;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Question create(String questionText, SurveyId surveyId, Set<QuestionOption> questionOptions, QuestionType questionType, boolean isRequired) {
        return new Question(QuestionId.generate(), surveyId,questionOptions, questionText, questionType, isRequired, Instant.now(), Instant.now());
    }

    public void addOption(Set<QuestionOption> optionSet) {
        this.questionOptions.addAll(optionSet);
    }


    public QuestionId getId() {
        return id;
    }

    public SurveyId getSurveyId() {
        return surveyId;
    }

    public String getQuestionText() {
        return questionText;
    }

    public QuestionType getQuestionType() {
        return questionType;
    }

    public boolean isRequired() {
        return isRequired;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Set<QuestionOption> getQuestionOptions() {
        return questionOptions;
    }
}
