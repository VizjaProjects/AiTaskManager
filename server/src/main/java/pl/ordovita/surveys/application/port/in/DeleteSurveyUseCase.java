package pl.ordovita.surveys.application.port.in;

import java.util.UUID;

public interface DeleteSurveyUseCase {

    record DeleteSurveyCommand(UUID surveyId) {}

    void deleteSurvey(DeleteSurveyCommand command);
}
