package pl.ordovita.surveys.infrastructure.adapter.questions;

import pl.ordovita.surveys.domain.model.questions.Question;
import pl.ordovita.surveys.domain.model.questions.QuestionId;
import pl.ordovita.surveys.domain.model.surveys.SurveyId;
import pl.ordovita.surveys.infrastructure.jpa.questions.QuestionEntity;
import pl.ordovita.surveys.infrastructure.jpa.surveys.SurveyEntity;


public class QuestionEntityMapper {

    public static QuestionEntity from(Question question) {
        SurveyEntity surveyEntity = new SurveyEntity();
        surveyEntity.setId(question.getSurveyId().value());

        return new QuestionEntity(question.getId().value(),
                surveyEntity,
                question.getQuestionText(),
                question.getQuestionType(),
                question.isRequired(),
                question.getCreatedAt(),
                question.getUpdatedAt()

        );
    }

    public static Question toDomain(QuestionEntity questionEntity) {

        return new Question(new QuestionId(questionEntity.getId()),
                new SurveyId(questionEntity.getSurveyId().getId()),
                questionEntity.getQuestionText(),
                questionEntity.getQuestionType(),
                questionEntity.isRequired(),
                questionEntity.getCreatedAt(),
                questionEntity.getUpdatedAt());
    }
}
