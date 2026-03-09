package pl.ordovita.surveys.domain.port;

import pl.ordovita.surveys.domain.model.questionOption.QuestionOption;
import pl.ordovita.surveys.domain.model.questionOption.QuestionOptionId;
import pl.ordovita.surveys.domain.model.questions.QuestionId;

import java.util.List;
import java.util.Optional;

public interface QuestionOptionRepository {
    Optional<QuestionOption> findById(QuestionOptionId id);
    QuestionOption save(QuestionOption questionOption);
    List<QuestionOption> findAllByQuestionId(QuestionId questionId);

}
