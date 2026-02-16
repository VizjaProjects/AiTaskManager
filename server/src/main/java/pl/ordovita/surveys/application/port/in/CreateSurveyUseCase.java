package pl.ordovita.surveys.application.port.in;

import java.time.Instant;
import java.util.UUID;

public interface CreateSurveyUseCase {

    record CreateSurveyCommand(String title, String description){}
    record CreateSurveyResult(UUID surveyId, Instant createdAt) {}

    CreateSurveyResult createSurvey(CreateSurveyCommand command);
}
