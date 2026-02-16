package pl.ordovita.surveys.domain.port;

import pl.ordovita.surveys.domain.model.surveys.Survey;
import pl.ordovita.surveys.domain.model.surveys.SurveyId;

import java.util.Optional;

public interface SurveyRepository {
    Survey save(Survey survey);
    Optional<Survey> findById(SurveyId id);
}
