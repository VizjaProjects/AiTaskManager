package pl.ordovita.surveys.domain.port;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.surveys.application.dto.UserResponseResult;
import pl.ordovita.surveys.domain.model.surveys.Survey;
import pl.ordovita.surveys.domain.model.surveys.SurveyId;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface SurveyRepository {
    Survey save(Survey survey);
    Optional<Survey> findById(SurveyId id);
    Set<Survey> getAllSurveys();
    Set<Survey> findAllActiveSurveys();
    Set<UserResponseResult> getAllUserResponseResults(UserId userId);
    void deleteSurveyWithAllData(SurveyId surveyId);
}
