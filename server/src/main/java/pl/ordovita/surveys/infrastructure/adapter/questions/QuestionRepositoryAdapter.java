package pl.ordovita.surveys.infrastructure.adapter.questions;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import pl.ordovita.surveys.domain.model.questions.Question;
import pl.ordovita.surveys.domain.model.questions.QuestionId;
import pl.ordovita.surveys.domain.port.QuestionRepository;
import pl.ordovita.surveys.infrastructure.jpa.questions.QuestionEntity;
import pl.ordovita.surveys.infrastructure.jpa.questions.QuestionJpaRepository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class QuestionRepositoryAdapter implements QuestionRepository {

    private final QuestionJpaRepository repository;

    @Override
    public Optional<Question> findById(QuestionId id) {
        return repository.findById(id.value()).map(QuestionEntityMapper::toDomain);
    }

    @Override
    public Question save(Question question) {
        QuestionEntity entity = QuestionEntityMapper.from(question);
        return QuestionEntityMapper.toDomain(repository.save(entity));
    }
}
