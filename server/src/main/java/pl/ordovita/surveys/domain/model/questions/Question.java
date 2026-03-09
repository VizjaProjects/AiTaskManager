package pl.ordovita.surveys.domain.model.questions;

import pl.ordovita.surveys.domain.exception.QuestionException;

import pl.ordovita.surveys.domain.model.surveys.SurveyId;

import java.time.Instant;

public class Question {
    private final QuestionId id;
    private SurveyId surveyId;
    private String questionText;
    private QuestionType questionType;
    private boolean isRequired;
    private final Instant createdAt;
    private Instant updatedAt;

    public Question(QuestionId id, SurveyId surveyId, String questionText, QuestionType questionType,  boolean isRequired, Instant createdAt, Instant updatedAt) {
        if(id == null) throw new QuestionException("id cannot be null");
        if(questionText == null) throw new QuestionException("questionText cannot be null");
        if(questionType == null) throw new QuestionException("questionType cannot be null");
        if(createdAt == null) throw new QuestionException("createdAt cannot be null");
        if(updatedAt == null) throw new QuestionException("updatedAt cannot be null");
        this.id = id;
        this.surveyId = surveyId;
        this.questionText = questionText;
        this.questionType = questionType;
        this.isRequired = isRequired;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Question create(String questionText, SurveyId surveyId, QuestionType questionType, boolean isRequired) {
        return new Question(QuestionId.generate(), surveyId, questionText, questionType, isRequired, Instant.now(), Instant.now());
    }

    public void edit(String questionText, QuestionType questionType, boolean isRequired) {
        if(questionText == null) throw new QuestionException("questionText cannot be null");
        if(questionType == null) throw new QuestionException("questionType cannot be null");
        this.questionText = questionText;
        this.questionType = questionType;
        this.isRequired = isRequired;
        this.updatedAt = Instant.now();
    }

    public void deleteQuestion(QuestionId id) {
        if (id == null) throw new QuestionException("id cannot be null");
        if (surveyId == null) throw new QuestionException("surveyId is already null");
        this.surveyId = null;
        this.isRequired = false;
        this.updatedAt = Instant.now();
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

}
