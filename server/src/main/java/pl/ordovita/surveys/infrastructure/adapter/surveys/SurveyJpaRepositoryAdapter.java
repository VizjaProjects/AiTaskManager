package pl.ordovita.surveys.infrastructure.adapter.surveys;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import pl.ordovita.surveys.domain.model.surveys.Survey;
import pl.ordovita.surveys.domain.model.surveys.SurveyId;
import pl.ordovita.surveys.domain.port.SurveyRepository;
import pl.ordovita.surveys.infrastructure.jpa.surveys.SurveyEntity;
import pl.ordovita.surveys.infrastructure.jpa.surveys.SurveyJpaRepository;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class SurveyJpaRepositoryAdapter implements SurveyRepository {

    private final SurveyJpaRepository surveyJpaRepository;

    @Override
    public Survey save(Survey survey) {
        SurveyEntity entity = SurveyEntityMapper.from(survey);
        return SurveyEntityMapper.toDomain(surveyJpaRepository.save(entity));
    }

    @Override
    public Optional<Survey> findById(SurveyId id) {
        return surveyJpaRepository.findById(id.value()).map(SurveyEntityMapper::toDomain);
    }

    @Override
    public Set<Survey> findAllActiveSurveys() {
        return surveyJpaRepository.findAllActiveSurveys().stream().map(SurveyEntityMapper::toDomain).collect(Collectors.toSet());
    }

    @Override
    public Set<Survey> getAllSurveys() {
        return surveyJpaRepository.findAll().stream().map(SurveyEntityMapper::toDomain).collect(Collectors.toSet());
    }
}
