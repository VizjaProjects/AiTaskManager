package pl.ordovita.surveys.infrastructure.adapter.surveys;

import pl.ordovita.surveys.domain.model.surveys.Survey;
import pl.ordovita.surveys.domain.model.surveys.SurveyId;
import pl.ordovita.surveys.infrastructure.jpa.surveys.SurveyEntity;

public class SurveyEntityMapper {

    public static SurveyEntity from(Survey survey) {
        return new SurveyEntity(
                survey.getId().value(),
                survey.getTitle(),
                survey.getDescription(),
                survey.getCreatedAt(),
                survey.getUpdatedAt(),
                survey.isVisible()
        );
    }

    public static Survey toDomain(SurveyEntity surveyEntity) {
        return new Survey(
                new SurveyId(surveyEntity.getId()),
                surveyEntity.getTitle(),
                surveyEntity.getDescription(),
                surveyEntity.getCreatedAt(),
                surveyEntity.getUpdatedAt(),
                surveyEntity.isVisible()
        );
    }
}
