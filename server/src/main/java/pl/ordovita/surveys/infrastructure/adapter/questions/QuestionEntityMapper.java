package pl.ordovita.surveys.infrastructure.adapter.questions;

import pl.ordovita.surveys.domain.model.questions.Question;
import pl.ordovita.surveys.domain.model.questions.QuestionId;
import pl.ordovita.surveys.domain.model.surveys.SurveyId;
import pl.ordovita.surveys.infrastructure.jpa.questions.QuestionEntity;
import pl.ordovita.surveys.infrastructure.jpa.surveys.SurveyEntity;


public class QuestionEntityMapper {

    public static QuestionEntity from(Question question) {
        SurveyEntity surveyEntity = new SurveyEntity();
        if(question.getSurveyId() != null) {
            surveyEntity.setId(question.getSurveyId().value());
        } else {
            surveyEntity = null;
        }

        return new QuestionEntity(question.getId().value(),
                surveyEntity,
                question.getQuestionText(),
                question.getQuestionType(),
                question.isRequired(),
                question.getHint(),
                question.getCreatedAt(),
                question.getUpdatedAt()

        );
    }

    public static Question toDomain(QuestionEntity questionEntity) {

        SurveyId surveyId;

        if(questionEntity.getSurveyId() != null) {
            surveyId = new SurveyId(questionEntity.getSurveyId().getId());
        } else {
            surveyId = new SurveyId(null);
        }

        return new Question(new QuestionId(questionEntity.getId()),
                surveyId,
                questionEntity.getQuestionText(),
                questionEntity.getQuestionType(),
                questionEntity.isRequired(),
                questionEntity.getHint(),
                questionEntity.getCreatedAt(),
                questionEntity.getUpdatedAt());
    }
}
