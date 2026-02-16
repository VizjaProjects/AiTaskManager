package pl.ordovita.surveys.domain.port;


import pl.ordovita.surveys.domain.model.questions.Question;
import pl.ordovita.surveys.domain.model.questions.QuestionId;

import java.util.Optional;

public interface QuestionRepository {
    Optional<Question> findById(QuestionId id);
    Question save(Question question);
}
