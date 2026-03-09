package pl.ordovita.surveys.application.port.in;

import java.time.Instant;
import java.util.UUID;

public interface EditSurveyUseCase {

    record EditSurveyCommand(UUID surveyId,String title, String description){}
    record EditSurveyResult(UUID surveyId, String title, String description, Instant updatedAt){}

    EditSurveyResult editSurvey(EditSurveyCommand command);
}
