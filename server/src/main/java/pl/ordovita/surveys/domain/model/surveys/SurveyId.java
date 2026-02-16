package pl.ordovita.surveys.domain.model.surveys;

import java.util.UUID;

public record SurveyId(UUID value) {


    public static SurveyId generate() {
        return new SurveyId(UUID.randomUUID());
    }
}
