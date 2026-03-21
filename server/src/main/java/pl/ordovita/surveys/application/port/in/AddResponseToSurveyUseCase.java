package pl.ordovita.surveys.application.port.in;

import pl.ordovita.surveys.application.dto.UserAnswer;


import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public interface AddResponseToSurveyUseCase {

    record AddResponseCommand(UUID surveyId, UUID questionId, String answer) {}
    record AddResponseResult(UUID questionId, UUID surveyId, String answer, Instant createdAt) {}


    AddResponseResult addResponse(AddResponseCommand command);
}
