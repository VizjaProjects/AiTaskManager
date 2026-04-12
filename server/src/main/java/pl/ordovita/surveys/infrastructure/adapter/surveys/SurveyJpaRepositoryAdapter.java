package pl.ordovita.surveys.infrastructure.adapter.surveys;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.surveys.application.dto.UserResponseResult;
import pl.ordovita.surveys.domain.model.surveys.Survey;
import pl.ordovita.surveys.domain.model.surveys.SurveyId;
import pl.ordovita.surveys.domain.port.SurveyRepository;
import pl.ordovita.surveys.infrastructure.jpa.questionOption.QuestionOptionJpaRepository;
import pl.ordovita.surveys.infrastructure.jpa.questions.QuestionJpaRepository;
import pl.ordovita.surveys.infrastructure.jpa.surveys.SurveyEntity;
import pl.ordovita.surveys.infrastructure.jpa.surveys.SurveyJpaRepository;
import pl.ordovita.surveys.infrastructure.jpa.userResponse.UserResponseJpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class SurveyJpaRepositoryAdapter implements SurveyRepository {

    private final SurveyJpaRepository surveyJpaRepository;
    private final QuestionJpaRepository questionJpaRepository;
    private final QuestionOptionJpaRepository questionOptionJpaRepository;
    private final UserResponseJpaRepository userResponseJpaRepository;

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

    @Override
    public Set<UserResponseResult> getAllUserResponseResults(UserId userId) {
        return surveyJpaRepository.getAllUserResponse(userId.value());
    }

    @Override
    @Transactional
    public void deleteSurveyWithAllData(SurveyId surveyId) {
        UUID id = surveyId.value();
        List<UUID> questionIds = questionJpaRepository.findIdsBySurveyId(id);
        if (!questionIds.isEmpty()) {
            userResponseJpaRepository.deleteAllByQuestionIds(questionIds);
            questionOptionJpaRepository.deleteAllByQuestionIds(questionIds);
        }
        questionJpaRepository.deleteAllBySurveyId(id);
        surveyJpaRepository.deleteById(id);
    }
}
