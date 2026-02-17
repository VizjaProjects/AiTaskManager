package pl.ordovita.surveys.domain.port;


import pl.ordovita.surveys.domain.model.questions.Question;
import pl.ordovita.surveys.domain.model.questions.QuestionId;
import pl.ordovita.surveys.domain.model.surveys.SurveyId;

import java.util.Optional;
import java.util.Set;

public interface QuestionRepository {
    Optional<Question> findById(QuestionId id);
    Question save(Question question);
    Set<Question> findAllBySurveyId(SurveyId surveyId);
}
