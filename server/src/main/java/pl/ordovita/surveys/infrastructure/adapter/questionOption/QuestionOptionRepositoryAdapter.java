package pl.ordovita.surveys.infrastructure.adapter.questionOption;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import pl.ordovita.surveys.domain.model.questionOption.QuestionOption;
import pl.ordovita.surveys.domain.model.questionOption.QuestionOptionId;
import pl.ordovita.surveys.domain.model.questions.QuestionId;
import pl.ordovita.surveys.domain.port.QuestionOptionRepository;
import pl.ordovita.surveys.infrastructure.jpa.questionOption.QuestionOptionEntity;
import pl.ordovita.surveys.infrastructure.jpa.questionOption.QuestionOptionJpaRepository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class QuestionOptionRepositoryAdapter implements QuestionOptionRepository {

    private final QuestionOptionJpaRepository repository;

    @Override
    public Optional<QuestionOption> findById(QuestionOptionId id) {
        return repository.findById(id.value()).map(QuestionOptionEntityMapper::toDomain);
    }

    @Override
    public QuestionOption save(QuestionOption questionOption) {
        QuestionOptionEntity entity = QuestionOptionEntityMapper.from(questionOption);
        return QuestionOptionEntityMapper.toDomain(repository.save(entity));
    }

    @Override
    public List<QuestionOption> findAllByQuestionId(QuestionId questionId) {
        return repository.findAllByQuestionId(questionId.value()).stream().map(QuestionOptionEntityMapper::toDomain).toList();
    }
}
