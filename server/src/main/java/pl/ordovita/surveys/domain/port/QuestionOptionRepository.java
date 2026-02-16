package pl.ordovita.surveys.domain.port;

import pl.ordovita.surveys.domain.model.questionOption.QuestionOption;
import pl.ordovita.surveys.domain.model.questionOption.QuestionOptionId;

import java.util.Optional;

public interface QuestionOptionRepository {
    Optional<QuestionOption> findById(QuestionOptionId id);
    QuestionOption save(QuestionOption questionOption);

}
