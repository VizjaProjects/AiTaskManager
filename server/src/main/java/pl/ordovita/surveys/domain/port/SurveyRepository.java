package pl.ordovita.surveys.domain.port;

import pl.ordovita.surveys.domain.model.surveys.Survey;
import pl.ordovita.surveys.domain.model.surveys.SurveyId;

import java.util.Optional;
import java.util.Set;

public interface SurveyRepository {
    Survey save(Survey survey);
    Optional<Survey> findById(SurveyId id);
    Set<Survey> getAllSurveys();
    Set<Survey> findAllActiveSurveys();

}
